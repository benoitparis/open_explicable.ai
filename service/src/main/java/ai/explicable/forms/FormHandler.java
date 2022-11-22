package ai.explicable.forms;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.javafp.parsecj.Parser;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequestEntry;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResponse;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.javafp.parsecj.Combinators.retn;
import static org.javafp.parsecj.Text.chr;
import static org.javafp.parsecj.Text.intr;

public class FormHandler implements RequestHandler<Map<String, Object>, String> {

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    Base64.Decoder decoder = Base64.getDecoder();

    Region region = Region.EU_WEST_1;
    EventBridgeClient eventBrClient = EventBridgeClient
            .builder()
            .region(region)
            .build();

    @Override
    public String handleRequest(Map<String, Object> event, Context context) {
        System.out.println("in handleRequest");
        try {
            String decodedString = null;
            System.out.println(event);
            Boolean is64 = (Boolean) event.get("isBase64Encoded");
            if (is64) {
                byte[] decodedBytes = decoder.decode(event.get("body").toString());
                decodedString = new String(decodedBytes);
            } else {
                decodedString = (String) event.get("body");
            }
            // TODO apache fileupload a une CVE transitive dans commons-io. on code à la main mais il faudra remplacer
            // utiliser ça: https://github.com/jon-hanson/parsecj?


            Map<String, Object> headers = (Map<String, Object>) event.get("headers");
            System.out.println(headers);
            String mime = headers.get("content-type").toString();
            System.out.println(mime);
            if (mime.startsWith("multipart/form-data")) {
                String boundary = mime.replace("multipart/form-data; boundary=", "").trim();
                System.out.println(boundary);

                Parser<Character, Integer> sum =
                        intr.bind(x ->                  // parse an integer and bind the result to the variable x.
                                chr('+').then(              // parse a '+' sign, and throw away the result.
                                        intr.bind(y ->          // parse an integer and bind the result to the variable y.
                                                retn(x+y))));       // return the sum of x and y.



                String[] parts = decodedString.split(boundary);

                if (!"--".equals(parts[parts.length - 1].trim())) {
                    System.err.println("No trailing dash in last multipart form-data: '" + parts[parts.length - 1] + "'");
                }

                String partPatternOld = "^Content-Disposition: form-data; name=([\"'])(?<paramname>[^\"|']*)([\"']); filename=([\"'])(?<filename>[^\"|']*)([\"'])((\\r)?\\nContent-Type: application/json)?(\\r)?\\n(?<body>.*)--(\\s*)$";
                String partPattern = "^\\r?\\n?C.*$";

                Pattern regex = Pattern.compile(partPattern);

                for (int i =0; i< parts.length-1; i++) {
                    String part = parts[i];
                    Matcher matcher = regex.matcher(part);

                    if (matcher.find()) {
                        String paramName = matcher.group("paramname");
                        String filename = matcher.group("filename");
                        String body = matcher.group("body");

                        System.out.println("paramname");
                        System.out.println(paramName);
                        System.out.println("filename");
                        System.out.println(filename);
                        System.out.println("body");
                        System.out.println(body);

                        // TODO upload to s3 directly? or later?

                    } else {
                        throw new RuntimeException("Non conforming multipart form-data: " + Arrays.asList(parts));
                    }

                }
//
//            } else {
                // TODO tester
                throw new RuntimeException("Unable to parse: \n" + event);
            }



            System.out.println(decodedString);
            System.out.println("in handleRequest3");

            Map<String, String> parameters = new LinkedHashMap<>();
            System.out.println("in handleRequest4");
            String[] keyValuePairs = decodedString.split("&");
            System.out.println("in handleRequest5");
            for (String keyValuePair : keyValuePairs) {
                String[] keyAndValue = keyValuePair.split("=");
                String key = URLDecoder.decode(keyAndValue[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(keyAndValue[1], StandardCharsets.UTF_8);
                parameters.put(key, value);
            }
            System.out.println("in handleRequest6");
            String message = gson.toJson(parameters);
            System.out.println("in handleRequest7");

            System.out.println(message);

            PutEventsRequestEntry request_entry = PutEventsRequestEntry.builder()
                    .detail(message)
                    .detailType("emailRequest")
                    .resources("arn:aws:events:eu-west-1:100172815067:event-bus/ai-explicable-event-bus")
                    .source("ai.explicable.forms.Formhandler")
                    .build();

            PutEventsRequest request = PutEventsRequest.builder()
                    .entries(request_entry)
                    .build();

            PutEventsResponse response = eventBrClient.putEvents(request);

            return message;
        } catch (Throwable t) {
            System.out.println("Throwing");
            System.out.println(t.getMessage());
            System.out.println(Arrays.asList(t.getStackTrace()).toString());
        }
        return "Error getting logger";

    }



}
