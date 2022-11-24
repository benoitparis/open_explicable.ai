package ai.explicable.forms;

import org.apache.commons.fileupload.MultipartStream;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import static java.text.MessageFormat.format;


public class DataParsing {

    static String CONTENT_DISPOSITION = "Content-Disposition: form-data; ";
    static String CONTENT_TYPE = "Content-Type: ";
    static final int BUFFER_SIZE = 8192;

    public static UserData parseMultipart(byte[] content, byte[] boundary) throws IOException {
        var contentIS = new ByteArrayInputStream(content);

        var multipartStream =
                new MultipartStream(contentIS, boundary, BUFFER_SIZE, null);

        var result = new UserData();

        boolean nextPart = multipartStream.skipPreamble();
        while (nextPart) {
            String header = multipartStream.readHeaders();

            Map<String, String> contentDisposition = null;
            String contentType = null;
            for (String headerLine: header.split("\\r\\n")) {
                if (headerLine.startsWith(CONTENT_DISPOSITION)) {
                    contentDisposition = getParametersContentDisposition(headerLine.split(CONTENT_DISPOSITION)[1]);
                } else if (headerLine.startsWith(CONTENT_TYPE)) {
                    contentType = headerLine.split(CONTENT_TYPE)[1];
                }
            }

            String paramName = contentDisposition.get("name");
            if (null != paramName && !"".equals(paramName)) {
                var baos = new ByteArrayOutputStream();
                multipartStream.readBodyData(baos);
                switch (paramName) {
                    case "name":
                        result.name = baos.toString();
                        break;
                    case "email":
                        result.email = baos.toString();
                        break;
                    case "message":
                        result.message = baos.toString();
                        break;
                    case "myFile":
                        result.fileName = contentDisposition.get("filename");
                        result.fileContentType = contentType;
                        result.fileContent = baos.toByteArray();
                        break;
                    default:
                        System.err.println("Unrecognized parameter: " + paramName);
                }
            } else {
                System.err.println("Content-Disposition must have a name " + contentDisposition);
            }
            nextPart = multipartStream.readBoundary();
        }

        return result;

    }

    private static Map<String, String> getParametersContentDisposition(String contentDisposition) {
        if (null == contentDisposition || "".equals(contentDisposition)) {
            System.err.println("Header must have contentDisposition");
        }
        String[] dispositionParts = contentDisposition.split("; ");
        var parameters = new HashMap<String, String>();
        for (String dispositionPart : dispositionParts) {
            String[] kv = dispositionPart.split("=");
            parameters.put(kv[0], kv[1].replaceAll("(^\"|\"$)", ""));
        }
        return parameters;
    }


    //// Testing

    static class TestPair {
        String body64;
        String boundary;

        public TestPair(String body64, String boundary) {
            this.body64 = body64;
            this.boundary = boundary;
        }
    }

    static TestPair[] testCases = new TestPair[] {
            new TestPair("LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpmZmRmZA0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJlbWFpbCINCg0KZmZmQGRkLmNvbQ0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJteUZpbGUiOyBmaWxlbmFtZT0iLmdpdGlnbm9yZSINCkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtDQoNCiMgU2VlIGh0dHBzOi8vaGVscC5naXRodWIuY29tL2FydGljbGVzL2lnbm9yaW5nLWZpbGVzLyBmb3IgbW9yZSBhYm91dCBpZ25vcmluZyBmaWxlcy4KCiMgZGVwZW5kZW5jaWVzCi9ub2RlX21vZHVsZXMKLy5wbnAKLnBucC5qcwoKIyB0ZXN0aW5nCi9jb3ZlcmFnZQoKIyBwcm9kdWN0aW9uCi9idWlsZAoKIyBtaXNjCi5EU19TdG9yZQouZW52LmxvY2FsCi5lbnYuZGV2ZWxvcG1lbnQubG9jYWwKLmVudi50ZXN0LmxvY2FsCi5lbnYucHJvZHVjdGlvbi5sb2NhbAoKbnBtLWRlYnVnLmxvZyoKeWFybi1kZWJ1Zy5sb2cqCnlhcm4tZXJyb3IubG9nKgoKLy5pZGVhDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlVMzc4d2JsdmFuVDVYTGFkLS0NCg=="
                    , "----WebKitFormBoundaryU378wblvanT5XLad"),
            new TestPair("LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5bzNneVY4Nk1HVkl3MXpmSw0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpuYW1lDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlvM2d5Vjg2TUdWSXcxemZLDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImVtYWlsIg0KDQplbWFpbEBwbG9wLmNvbQ0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5bzNneVY4Nk1HVkl3MXpmSw0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJteUZpbGUiOyBmaWxlbmFtZT0icGFja2FnZS5qc29uIg0KQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uDQoNCnsKICAibmFtZSI6ICJleHBsaWNhYmxlLXRlc3QiLAogICJ2ZXJzaW9uIjogIjAuMS4wIiwKICAicHJpdmF0ZSI6IHRydWUsCiAgImRlcGVuZGVuY2llcyI6IHsKICAgICJAZHNucC9wYXJxdWV0anMiOiAiXjEuMi4xIiwKICAgICJAcmVhY3QtdGhyZWUvZHJlaSI6ICJeOS4zNi4wIiwKICAgICJAcmVhY3QtdGhyZWUvZmliZXIiOiAiXjguOC4xMCIsCiAgICAiQHRlc3RpbmctbGlicmFyeS9qZXN0LWRvbSI6ICJeNS4xNi41IiwKICAgICJAdGVzdGluZy1saWJyYXJ5L3JlYWN0IjogIl4xMy40LjAiLAogICAgIkB0ZXN0aW5nLWxpYnJhcnkvdXNlci1ldmVudCI6ICJeMTMuNS4wIiwKICAgICJAdHlwZXMvZDMiOiAiXjcuNC4wIiwKICAgICJAdHlwZXMvamVzdCI6ICJeMjcuNS4yIiwKICAgICJAdHlwZXMvbm9kZSI6ICJeMTYuMTEuNjUiLAogICAgIkB0eXBlcy9yZWFjdCI6ICJeMTguMC4yMSIsCiAgICAiQHR5cGVzL3JlYWN0LWRvbSI6ICJeMTguMC42IiwKICAgICJkMyI6ICJeNy42LjEiLAogICAgInBsb3RseS5qcyI6ICJeMi4xNi4xIiwKICAgICJyZWFjdCI6ICJeMTguMi4wIiwKICAgICJyZWFjdC1kb20iOiAiXjE4LjIuMCIsCiAgICAicmVhY3QtZHJhZ2dhYmxlIjogIl40LjQuNSIsCiAgICAicmVhY3QtcGxvdGx5LmpzIjogIl4yLjYuMCIsCiAgICAicmVhY3Qtc2NyaXB0cyI6ICI1LjAuMSIsCiAgICAic291cmNlLW1hcC1leHBsb3JlciI6ICJeMi41LjMiLAogICAgInRocmVlIjogIl4wLjE0NS4wIiwKICAgICJ0aHJlZS1vcmJpdGNvbnRyb2xzLXRzIjogIl4wLjEuMiIsCiAgICAidHlwZXNjcmlwdCI6ICJeNC44LjQiLAogICAgIndlYi12aXRhbHMiOiAiXjIuMS40IgogIH0sCiAgInNjcmlwdHMiOiB7CiAgICAiYW5hbHl6ZSI6ICJzb3VyY2UtbWFwLWV4cGxvcmVyICdidWlsZC9zdGF0aWMvanMvKi5qcyciLAogICAgInN0YXJ0IjogInJlYWN0LXNjcmlwdHMgc3RhcnQiLAogICAgImJ1aWxkIjogInJlYWN0LXNjcmlwdHMgYnVpbGQiLAogICAgInRlc3QiOiAicmVhY3Qtc2NyaXB0cyB0ZXN0IiwKICAgICJlamVjdCI6ICJyZWFjdC1zY3JpcHRzIGVqZWN0IgogIH0sCiAgImVzbGludENvbmZpZyI6IHsKICAgICJleHRlbmRzIjogWwogICAgICAicmVhY3QtYXBwIiwKICAgICAgInJlYWN0LWFwcC9qZXN0IgogICAgXQogIH0sCiAgImJyb3dzZXJzbGlzdCI6IHsKICAgICJwcm9kdWN0aW9uIjogWwogICAgICAiPjAuMiUiLAogICAgICAibm90IGRlYWQiLAogICAgICAibm90IG9wX21pbmkgYWxsIgogICAgXSwKICAgICJkZXZlbG9wbWVudCI6IFsKICAgICAgImxhc3QgMSBjaHJvbWUgdmVyc2lvbiIsCiAgICAgICJsYXN0IDEgZmlyZWZveCB2ZXJzaW9uIiwKICAgICAgImxhc3QgMSBzYWZhcmkgdmVyc2lvbiIKICAgIF0KICB9LAogICJkZXZEZXBlbmRlbmNpZXMiOiB7CiAgICAiQHR5cGVzL3BhcnF1ZXRqcyI6ICJeMC4xMC4zIiwKICAgICJAdHlwZXMvcGxvdGx5LmpzIjogIl4yLjEyLjciLAogICAgIkB0eXBlcy9yZWFjdC1wbG90bHkuanMiOiAiXjIuNS4yIiwKICAgICJAdHlwZXMvdGhyZWUiOiAiXjAuMTQ0LjAiCiAgfQp9Cg0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5bzNneVY4Nk1HVkl3MXpmSy0tDQo="
                    , "----WebKitFormBoundaryo3gyV86MGVIw1zfK"),
            new TestPair("LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5QWdzOU5GYlExSEk0czlRZw0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpyDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlBZ3M5TkZiUTFISTRzOVFnDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImVtYWlsIg0KDQpyQGQuZA0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5QWdzOU5GYlExSEk0czlRZw0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJteUZpbGUiOyBmaWxlbmFtZT0idGVzdC54bHN4Ig0KQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldA0KDQpQSwMEFAAICAgAfYR3VQAAAAAAAAAAAAAAAAsAAABfcmVscy8ucmVsc62Sz2rDMAyH730Ko3vjtIUxRpxeyqC3MroH0GwlMYn/YGtb9vYzY7B1lLDBjpZ/+vQh1OxnN4kXStkGr2BT1SDI62Cs7xU8nu/Xt7BvV80DTcglkgcbsyg9PisYmOOdlFkP5DBXIZIvP11IDrk8Uy8j6hF7ktu6vpHpOwPaC6Y4GgXpaDYgzm+RfsMOXWc1HYJ+duT5yogfiULG1BMrmCf5GtL4FMJYFSjI6y7bv7qYBRdHjAYZpQ6J1jEVSGJL+cuqdJ9KOX8klrx2/7kjmpm8IbOshDF+Gq0aeXEL7TtQSwcIa792BN8AAABCAgAAUEsDBBQACAgIAH2Ed1UAAAAAAAAAAAAAAAAPAAAAeGwvd29ya2Jvb2sueG1sjVPbbtswDH3fVxh6T3xJk6VBnCJzarTAbmi69lm26ViLLBkSnUuH/ftoOe46bA97sCWS0uEhebS8OdXSO4CxQquYheOAeaByXQi1i9m3x3Q0Z55FrgoutYKYncGym9W75VGbfab13qP7ysasQmwWvm/zCmpux7oBRZFSm5ojmWbn28YAL2wFgLX0oyCY+TUXivUIC/M/GLosRQ4bnbc1KOxBDEiOxN5WorFstSyFhKe+II83zWdeE+2Ey5z5q1faX42X8XzfNimdjlnJpQUqtNLHL9l3yJEq4lIyr+AIia4bypAJKfA8nP0DSyNdoXzk7BxPAo72d7wzHfSdNuJFK+RymxstZczQtJe0xBhF/q/ItuvYI8/s4Dw9C1XoY8xoVuc3+6PbPosCK5rkbDK/Gnx3IHYVxmweXkfMQ549dB2L2TSga6UwFl0Sh8KpkgNQvs6igvw3FbnhDaunXGdTaIWUEHZkyXtfUG4nGaTgQViRSeJsFoIC5r6IHOYARAXnNAqBYFyjW0Ukwo6VgfKTLghiTWiX+OucLvYGJHKiOQ6CsIOFE3606NaLqKSm/V/CkiIz0EvJqYp5rREx+/F+Fs2S+SwaRetwMgrD2+now+RqOkpv05Ral2yS6/QnKcyhLuhLevoWDT2XByi3ZxruqVfb2lHy6VT/d8z8QROrX1BLBwjme/ng/wEAAHkDAABQSwMEFAAICAgAfYR3VQAAAAAAAAAAAAAAAA0AAAB4bC9zdHlsZXMueG1s7VhPT9swHL3vU1i+jyQlFJjSIMbUaZcJjSIhTTuYxEks/CeyXWj49Ps5TtOEwiZ1hxWpJ9svv/f88uyodpOLleDokWrDlJzh6CjEiMpM5UyWM3y7mH88w8hYInPClaQz3FCDL9IPibENpzcVpRaBgjQzXFlbfwoCk1VUEHOkairhSaG0IBaGugxMrSnJjSMJHkzCcBoIwiROE7kUc2ENytRSWrDRQ8g333IApzFGXu5K5WDlK5VUE46DNAk6gTQplNzoxNgDaWKe0SPhIBK6ckkE9eNLzbxCQQTjjQcnraQn7kAP94beNi4UxnkfygR7IE1qYi3Vcg4D1PUXTQ3JSlhqL9PW/aW61KSJJicDQtvAvPdK57C1hsvqIZQzUipJ+G09wwXhhuIe+qKe5BpME04LC8KalZVrraoDJ2KtEtBZc9zUXrnvwPQZ5fzG7dO7YvP2IYiuiu19JdsBbH/nvet6pW5A6po3c+VErF7SDvjcloygS85KKeiLwmutLM1s+5m1cJqQdSGqlGbPIO0WsOy2tfsqLcsc5N8XI0tX9oeyxKuApydN6gWAfYhM5u3E8MxUmsmHhZqz/jHEVPc2EFfZA83XJiuWA3VQGayKF0mFm5yiXXPqfL4MaggPk1pvg/djZnIw84aZnb+tg5mDmYOZg5mDmV3MxMf79EsZR3vlJt4rN5N9cnP+n80Ew+O7P8wPzvHRrsf4VbHtfOjnH62/gzN90EU5uCD1sU7xAEXuqjnD392dmw+Su18ybpn0o2CbcKWEIOv66GREOH6TgH6Gv3rSdESavkpaak1l1vSc0xEn/hNnNNfZiHf6Gu+a6gzWoKecjyj+6rsJEwabv0fS31BLBwiMT4YUgwIAAGMRAABQSwMEFAAICAgAfYR3VQAAAAAAAAAAAAAAABgAAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWy9Vk1v2zgQve+vIHToaWtZSp2vyi4CZ70tkMZBnW6BvdEiZRGhOCxJ2Ul+/Q6pzzrFIuihARKbM+SbN284w2QfHitJ9txYAWoeJZNpRLjKgQm1m0df71dvzyNiHVWMSlB8Hj1xG31Y/JEdwDzYknNHEEDZeVQ6py/j2OYlr6idgOYKPQWYijpcml1steGUhUOVjNPp9DSuqFBRg3BpXoMBRSFyfg15XXHlGhDDJXVI35ZC2w7tkb0Kjxl6wFQ7PiOK142nx0vevcCrRG7AQuEmOVQttZdZXsQXP+T5aNJfQ0pmmOpe+EqlHViVvybLipqHWr9FbI1KbYUU7ikkHC2ygH9nSCGk4+YzMCxyQaXl6NN0xzfcfdXB7+7hDg2dO15kcXt4kTGB9fDMiOHFPLpKLq9O/I6w4R/BD3b0ndgSDivkV0tqO7hg/NsIdiMUR6szdWv8AoclyI+oBV7TseNfjqJ1BiN2JTK84YXrIR3dbrjkueNsfG5dO4lBNk/VFmQPwHhBa+k8BQwHprPvkfE8Ul5OiZCgfYgll9KnGZHc7/2E+KfvIvIMUG1yKlGkZDodrW/D8WOrl/OGPkEdZGm9vrO2AA/e5HGnvkghCy+vpr4LWxYRoWjd84bN6ny8bo4S+z0UBH19vTzw+HtXmlW4MVjqVglU4ZtgrkReyWR2Mktmp+ms1wmr8pF7zdGdTjD0M1ajs7T6QyP0Dd9zifsDobENIzT5xT8QaPlcU0cXmYEDwVp4pWvroGo29SGG+KVgjKve0ez+H0KBDVZPUm39/egufe7D+crasAMPW7TuF9Ms3iPTHH+RU08s/c3E0hExFYglPyd28puJnbxQ7JhYPCqrNkK5tQ5zm5TY2zhrh1mwG+bAsQXnUdeZJRjxDMpRucTHgJuBk3/RnMhfOuJmqH2mZicwsAzTYjo5Oz+btSNkWGKThRdxlp71P6jaFhzK9DNPGUbUAFAAuNE67gdqrbGPNTcb8YzNfIHCjWZGGLRd47XLvtMi4iHWJsRhcFD3JVdrzBYrZQQmG17CeaTBOEMFToitpPnDlWLfSuH62U3w3RvNyRznxRIq/6RaP+oU93GNdX5A3dbVljcdWFu+OjYfl+JaC7x7PpGuBoMlBy18TROvRaPWKmhEmCgKrJNyAX+g2ZnXjP21H+7qIgPGmhdh8YZW+v0y/H3zvQb3/h7fIktu8Z35AhVVfzazt/GFbUkaPq6yeEDxgA2XXwL0ipDw/S6gtlBZPM4Sl/2/TYv/AFBLBwjnVsw3swMAAHoJAABQSwMEFAAICAgAfYR3VQAAAAAAAAAAAAAAABQAAAB4bC9zaGFyZWRTdHJpbmdzLnhtbH2OTQ6CMBCF956imb0UWRhD2rIwegHxAA2M0oROoVOI3t5qYty5fHnf+1HNw49ixcgukIZdUYJA6kLv6K7h2p63BxCcLPV2DIQansjQmI1iTiJHiTUMKU21lNwN6C0XYULKzi1Eb1OW8S55imh7HhCTH2VVlnvprSMQXVgoaahALOTmBY9fbRQ7oz4TNU+2y8u5gzGuCKY9XVolk1HyDf0B5/mHyfzYvABQSwcIopCLxqkAAADvAAAAUEsDBBQACAgIAH2Ed1UAAAAAAAAAAAAAAAAaAAAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHOtkU1rwzAMhu/9FUb3xUkHY4w4vYxBr/34AcZR4tDENpLWtf9+LhtbCmXs0JPQ1/O+SPXqNI3qiMRDDAaqogSFwcV2CL2B/e7t4RlWzaLe4Gglj7AfEqu8E9iAF0kvWrPzOFkuYsKQO12kyUpOqdfJuoPtUS/L8knTnAHNFVOtWwO0bitQu3PC/7Bj1w0OX6N7nzDIDQnNch6RM9FSj2LgKy8yB/Rt+eU95T8iHdgjyq+Dn1I2dwnVX2Ye73oLbwnbrVB+7Pwk8/K3mUWtr97dfAJQSwcIT/D5etIAAAAlAgAAUEsDBBQACAgIAH2Ed1UAAAAAAAAAAAAAAAARAAAAZG9jUHJvcHMvY29yZS54bWyVUstOwzAQvPMVke+J60TlESWpBKgnKiEoAnEz9jY1xI5lu0379zhJkxbohdvOznj25Wy2k1WwBWNFrXJEogkKQLGaC1Xm6GU5D69RYB1VnFa1ghztwaJZcZExnbLawKOpNRgnwAbeSNmU6RytndMpxpatQVIbeYXy5Ko2kjoPTYk1ZV+0BBxPJpdYgqOcOopbw1CPjuhgydloqTem6gw4w1CBBOUsJhHBR60DI+3ZBx1zopTC7TWclQ7kqN5ZMQqbpomapJP6/gl+Wzw8d6OGQrWrYoCK7NBIygxQBzzwBmlfbmBek7v75RwV8SSOQ0LCOFmSqzSZpuTmPcO/3reGfVybomWPwMccLDNCO3/DnvyR8Liiqtz4hRcrE86fOsmYak9ZUesW/ugrAfx27z3O5IaO5CH3n5GmpyMNBl1lA1vR/r2CdEVH2HZtNx+fwFw/0gh87ISroE8P4Z//WHwDUEsHCFAFS6ZgAQAA2wIAAFBLAwQUAAgICAB9hHdVAAAAAAAAAAAAAAAAEAAAAGRvY1Byb3BzL2FwcC54bWydkbtOwzAUhneeIrJYGztuSELluEJCTEgwhMIWGfu4NUpsKzalfXvcVrSdOdO56fvPhS1345BtYQrG2RYVOUEZWOmUsesWvXVPswZlIQqrxOAstGgPAS35DXudnIcpGghZItjQok2MfoFxkBsYRchT2aaKdtMoYgqnNXZaGwmPTn6PYCOmhFQYdhGsAjXzZyA6ERfb+F+ocvIwX1h1e594nHUw+kFE4Axf3M5FMXRmBE5S+hywB+8HI0VMF+HP5nOCl6MErvMyp/n89t1Y5X5C/9FUfVVmVy19WuILZMTzhgLoQlNa1UTXuiyKRjaSKkUpBVkLRci9Eprha7GD8ur0Cl7c5STZseEvx/Dl6vwXUEsHCPVG5ecPAQAAugEAAFBLAwQUAAgICAB9hHdVAAAAAAAAAAAAAAAAEwAAAFtDb250ZW50X1R5cGVzXS54bWy9lMtOwzAQRff9ishbFLtlgRBK0gWPJVSirJGJJ4lp/JDtlvbvGadQVSW0ICJWVjxz75mZ2M6ma9UmK3BeGp2TCR2TBHRphNR1Tp7md+klmRajbL6x4BPM1T4nTQj2ijFfNqC4p8aCxkhlnOIBP13NLC8XvAZ2Ph5fsNLoADqkIXqQIruBii/bkNyucXvLRTlJrrd5EZUTbm0rSx4wzGKU9eoctP6IcKXFQXXpR2UUlV2Ob6T1Z98TrK4PAFLFzuJ+v+LVQr+kC6DmAcftpIBkxl245woT2HPshNGB++kjrVv2ZtzixZgFPT72HpqpKlmCMOVSoYR664AL3wAE1dJupYpLfYLvw6YFPzS9M/1B553As26ZDFzEzv/UBBruQDwGh9ds8EHse5+oY3vs9s/DfxxBLHzmjPX4Mjj4ffefvKhOLRqBC/L4r98R0frP44Z41wWIr+xRxrqHsngHUEsHCJSyzHFdAQAAVwUAAFBLAQIUABQACAgIAH2Ed1Vrv3YE3wAAAEICAAALAAAAAAAAAAAAAAAAAAAAAABfcmVscy8ucmVsc1BLAQIUABQACAgIAH2Ed1Xme/ng/wEAAHkDAAAPAAAAAAAAAAAAAAAAABgBAAB4bC93b3JrYm9vay54bWxQSwECFAAUAAgICAB9hHdVjE+GFIMCAABjEQAADQAAAAAAAAAAAAAAAABUAwAAeGwvc3R5bGVzLnhtbFBLAQIUABQACAgIAH2Ed1XnVsw3swMAAHoJAAAYAAAAAAAAAAAAAAAAABIGAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWxQSwECFAAUAAgICAB9hHdVopCLxqkAAADvAAAAFAAAAAAAAAAAAAAAAAALCgAAeGwvc2hhcmVkU3RyaW5ncy54bWxQSwECFAAUAAgICAB9hHdVT/D5etIAAAAlAgAAGgAAAAAAAAAAAAAAAAD2CgAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHNQSwECFAAUAAgICAB9hHdVUAVLpmABAADbAgAAEQAAAAAAAAAAAAAAAAAQDAAAZG9jUHJvcHMvY29yZS54bWxQSwECFAAUAAgICAB9hHdV9Ubl5w8BAAC6AQAAEAAAAAAAAAAAAAAAAACvDQAAZG9jUHJvcHMvYXBwLnhtbFBLAQIUABQACAgIAH2Ed1WUssxxXQEAAFcFAAATAAAAAAAAAAAAAAAAAPwOAABbQ29udGVudF9UeXBlc10ueG1sUEsFBgAAAAAJAAkAPwIAAJoQAAAAAA0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5QWdzOU5GYlExSEk0czlRZy0tDQo="
                    , "----WebKitFormBoundaryAgs9NFbQ1HI4s9Qg")
    };

    public static void main(String[] args) throws Exception {
        for (TestPair testPair: testCases) {
            System.out.println("============= TEST CASE ================");
            byte[] bytes = Base64.getDecoder().decode(testPair.body64);
            var userData = parseMultipart(bytes, testPair.boundary.getBytes());
            System.out.println(format("valid: {0}", userData.valid()));
            System.out.println(userData);
            System.out.println("========================================");
        }
    }

}
