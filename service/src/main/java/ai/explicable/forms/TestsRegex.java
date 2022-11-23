package ai.explicable.forms;

import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class UserData {
    String name;
    String email;
    String message;
    String fileName;
    String fileContent;

    boolean valid() {
        return null != name  && !"".equals(name )
            && null != email && !"".equals(email)
        ;
    }

    @Override
    public String toString() {
        return "UserData{" +
            "name='" + name + '\'' +
            ", email='" + email + '\'' +
            ", message='" + message + '\'' +
            ", fileName='" + fileName + '\'' +
            ", fileContent='" + fileContent + '\'' +
        '}';
    }
}


public class TestsRegex {

    // from stackoverflow
    static String whitespace_chars =  ""       /* dummy empty string for homogeneity */
            + "\\u0009" // CHARACTER TABULATION
            + "\\u000A" // LINE FEED (LF)
            + "\\u000B" // LINE TABULATION
            + "\\u000C" // FORM FEED (FF)
            + "\\u000D" // CARRIAGE RETURN (CR)
            + "\\u0020" // SPACE
            + "\\u0085" // NEXT LINE (NEL)
            + "\\u00A0" // NO-BREAK SPACE
            + "\\u1680" // OGHAM SPACE MARK
            + "\\u180E" // MONGOLIAN VOWEL SEPARATOR
            + "\\u2000" // EN QUAD
            + "\\u2001" // EM QUAD
            + "\\u2002" // EN SPACE
            + "\\u2003" // EM SPACE
            + "\\u2004" // THREE-PER-EM SPACE
            + "\\u2005" // FOUR-PER-EM SPACE
            + "\\u2006" // SIX-PER-EM SPACE
            + "\\u2007" // FIGURE SPACE
            + "\\u2008" // PUNCTUATION SPACE
            + "\\u2009" // THIN SPACE
            + "\\u200A" // HAIR SPACE
            + "\\u2028" // LINE SEPARATOR
            + "\\u2029" // PARAGRAPH SEPARATOR
            + "\\u202F" // NARROW NO-BREAK SPACE
            + "\\u205F" // MEDIUM MATHEMATICAL SPACE
            + "\\u3000" // IDEOGRAPHIC SPACE
    ;
    /* A \s that actually works for Java’s native character set: Unicode */
    static String     whitespace_charclass = "["  + whitespace_chars + "]";
    /* A \S that actually works for  Java’s native character set: Unicode */
    static String non_whitespace_charclass = "[^" + whitespace_chars + "]";

    static String group(String content, boolean required) {
        return "(" + content + ")" + (required ? "" : "?");
    }
    static String line(String content) {
        return content + whitespace_charclass + "{2}";
    }
    static String param(String name) {
        return name + "=\"" + "(?<" + name + "ParamX" + ">[^\"]+)" + "\"";
    }

    static String part = ""
        + line( ""
            + "Content-Disposition: form-data; "
            + param("name")
            + group("; " + param("filename"), false)
        )
        + group(line("Content-Type: application/octet-stream"), false)
        + line("")
        + line("(?<bodyParamX>.*)")
    ;

    static Pattern multipartPattern(String boundary) {
        String separation = line("--" + boundary);
        String epilogue = line("--" + boundary + "--");
        String pattern = "^"
            + group(separation + part.replace("ParamX>", "Param0>"), true)
            + group(separation + part.replace("ParamX>", "Param1>"), true)
            + group(separation + part.replace("ParamX>", "Param2>"), false)
            + group(separation + part.replace("ParamX>", "Param3>"), true)
            + epilogue
            + "$"
        ;
        System.out.println(pattern);
        return Pattern.compile(pattern, Pattern.DOTALL);
    }

    static UserData parse(String content, String boundary) {
        Matcher matcher = multipartPattern(boundary).matcher(content);
        if (matcher.find()) {

            var result = new UserData();

            if ("name".equals(matcher.group("nameParam0"))) {
                result.name = matcher.group("bodyParam0");
            }
            if ("email".equals(matcher.group("nameParam1"))) {
                result.email = matcher.group("bodyParam1");
            }
            if ("message".equals(matcher.group("nameParam2"))) {
                result.message = matcher.group("bodyParam2");
            }
            if ("myFile".equals(matcher.group("nameParam3"))) {
                result.fileName = matcher.group("filenameParam3");
                result.fileContent = matcher.group("bodyParam3");
            }

            if (result.valid()) {
                return result;
            } else {
                throw new RuntimeException("Non valid user data object: " + result);
            }

        } else {
            throw new RuntimeException("Unable to parse user data: \n" + boundary + "\n" + content);
        }

    }



    public static void main(String[] args) throws Exception {

        String fromProd = "LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpmZmRmZA0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJlbWFpbCINCg0KZmZmQGRkLmNvbQ0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJteUZpbGUiOyBmaWxlbmFtZT0iLmdpdGlnbm9yZSINCkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtDQoNCiMgU2VlIGh0dHBzOi8vaGVscC5naXRodWIuY29tL2FydGljbGVzL2lnbm9yaW5nLWZpbGVzLyBmb3IgbW9yZSBhYm91dCBpZ25vcmluZyBmaWxlcy4KCiMgZGVwZW5kZW5jaWVzCi9ub2RlX21vZHVsZXMKLy5wbnAKLnBucC5qcwoKIyB0ZXN0aW5nCi9jb3ZlcmFnZQoKIyBwcm9kdWN0aW9uCi9idWlsZAoKIyBtaXNjCi5EU19TdG9yZQouZW52LmxvY2FsCi5lbnYuZGV2ZWxvcG1lbnQubG9jYWwKLmVudi50ZXN0LmxvY2FsCi5lbnYucHJvZHVjdGlvbi5sb2NhbAoKbnBtLWRlYnVnLmxvZyoKeWFybi1kZWJ1Zy5sb2cqCnlhcm4tZXJyb3IubG9nKgoKLy5pZGVhDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlVMzc4d2JsdmFuVDVYTGFkLS0NCg==";
        String message = new String(Base64.getDecoder().decode(fromProd));
        System.out.println(message);
        String boundary = "----WebKitFormBoundaryU378wblvanT5XLad";
        System.out.println("===========================================");

        var userData = parse(message, boundary);
        System.out.println(userData);
    }
}
