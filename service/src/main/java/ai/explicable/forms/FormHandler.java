package ai.explicable.forms;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequestEntry;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResponse;

import java.io.ByteArrayInputStream;
import java.text.SimpleDateFormat;
import java.util.*;

import static java.text.MessageFormat.format;


class UserData {
    String name;
    String email;
    String message;
    String fileName;
    String fileContentType;
    byte[] fileContent;

    boolean valid() {
        return null != name  && !"".equals(name)
                && null != email && !"".equals(email)
        ;
    }

    Map<String, String> asMapNoFileContent() {
        var result = new LinkedHashMap<String, String>();
        result.put("name", name);
        result.put("email", email);
        result.put("message", message);
        result.put("fileName", fileName);
        result.put("fileContentType", fileContentType);
        return result;
    }

    @Override
    public String toString() {
        return "UserData{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", message='" + message + '\'' +
                ", fileName='" + fileName + '\'' +
                ", fileContentType='" + fileContentType + '\'' +
                ", fileContent length='" + fileContent.length + '\'' +
                '}';
    }
}
class UserContactFormData {
    Map<String, String> userDataMap;
    String clientUUID;
    String s3UserDataPath;
    String s3FilePath;
}

public class FormHandler implements RequestHandler<Map<String, Object>, String> {

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    Base64.Decoder decoder = Base64.getDecoder();
    Region region = Region.EU_WEST_1;
    Regions regions = Regions.EU_WEST_1;
    EventBridgeClient eventBrClient = EventBridgeClient
            .builder()
            .region(region)
            .build();
    AmazonS3 s3Client =  AmazonS3ClientBuilder
            .standard()
            .withRegion(regions)
            .build();


    @Override
    public String handleRequest(Map<String, Object> event, Context context) {

        try {

            if (!(Boolean) event.get("isBase64Encoded")) {
                System.err.println("Content is not 64 encoded");
                System.err.println(event);
            }
            byte[] decodedBytes = decoder.decode(event.get("body").toString());

            Map<String, Object> headers = (Map<String, Object>) event.get("headers");
            System.out.println(headers);
            String requestContentType = headers.get("content-type").toString();
            System.out.println(requestContentType);

            if (requestContentType.startsWith("multipart/form-data")) {
                byte[] boundary = requestContentType.replace("multipart/form-data; boundary=", "").trim().getBytes();

                UserData userData = DataParsing.parseMultipart(decodedBytes, boundary);
                UserContactFormData contactData = getUserContactFormData(userData);
                String jsonContactData = gson.toJson(contactData);

                s3Put(userData, contactData, jsonContactData);

//                PutEventsResponse response = eventBridgePut(jsonContactData);

//                System.out.println("Event status: " + response.sdkHttpResponse().statusCode());

                return gson.toJson(jsonContactData);

            } else {
                throw new RuntimeException("Message was not multipart");
            }

        } catch (Throwable t) {
            System.out.println(event);
            System.out.println(t);
            throw new RuntimeException(t);
        }
    }


    static String BRIDGE_ADDRESS = "arn:aws:events:eu-west-1:100172815067:event-bus/ai-explicable-event-bus";

    private PutEventsResponse eventBridgePut(String jsonContactData) {
        System.out.println("Putting event");
        PutEventsRequestEntry request_entry = PutEventsRequestEntry.builder()
                .detail(jsonContactData)
                .detailType(UserContactFormData.class.getName())
                .resources(BRIDGE_ADDRESS)
                .source(this.getClass().getCanonicalName())
                .build();

        PutEventsRequest request = PutEventsRequest.builder()
                .entries(request_entry)
                .build();

        PutEventsResponse response = eventBrClient.putEvents(request);

        return response;
    }

    static String APP_BUCKET = "app.explicable.ai";

    private void s3Put(UserData userData, UserContactFormData contactData, String jsonContactData) {

        ObjectMetadata jsonMetadata = new ObjectMetadata();
        jsonMetadata.setContentType("application/json");

        System.out.println("Data:");
        System.out.println(jsonContactData);

        System.out.println("S3 Upload");
        s3Client.putObject(
                APP_BUCKET,
            contactData.s3UserDataPath,
            new ByteArrayInputStream(jsonContactData.getBytes()),
            jsonMetadata
        );

        if (null != userData.fileName) {
            ObjectMetadata objectMetadata = new ObjectMetadata();
            objectMetadata.setContentType(userData.fileContentType);
            s3Client.putObject(
                APP_BUCKET,
                contactData.s3FilePath,
                new ByteArrayInputStream(userData.fileContent),
                objectMetadata
            );
        }
    }

    static String S3_PATH_PATTERN = "front/userdata/staging/contact-form/{0}__{1}/";
    SimpleDateFormat s3SortableDateFormat = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
    private UserContactFormData getUserContactFormData(UserData userData) {
        UUID uuid = UUID.randomUUID();
        String basePath =
            format(S3_PATH_PATTERN, s3SortableDateFormat.format(new Date()), uuid);

        var data = new UserContactFormData();
        data.userDataMap = userData.asMapNoFileContent();
        data.clientUUID = uuid.toString();
        data.s3UserDataPath = basePath + "user-contact-data.json";

        if (null != userData.fileName) {
            data.s3FilePath = basePath + userData.fileName.replaceAll("[^a-zA-Z0-9\\.]+", "_");
        }
        return data;
    }


}
