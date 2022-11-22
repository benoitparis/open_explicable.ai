package ai.explicable.forms;

import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;



public class TestsRegex {

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

    public static void main(String[] args) throws Exception {

        String fromProd = "LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpmZmRmZA0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJlbWFpbCINCg0KZmZmQGRkLmNvbQ0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJteUZpbGUiOyBmaWxlbmFtZT0iLmdpdGlnbm9yZSINCkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtDQoNCiMgU2VlIGh0dHBzOi8vaGVscC5naXRodWIuY29tL2FydGljbGVzL2lnbm9yaW5nLWZpbGVzLyBmb3IgbW9yZSBhYm91dCBpZ25vcmluZyBmaWxlcy4KCiMgZGVwZW5kZW5jaWVzCi9ub2RlX21vZHVsZXMKLy5wbnAKLnBucC5qcwoKIyB0ZXN0aW5nCi9jb3ZlcmFnZQoKIyBwcm9kdWN0aW9uCi9idWlsZAoKIyBtaXNjCi5EU19TdG9yZQouZW52LmxvY2FsCi5lbnYuZGV2ZWxvcG1lbnQubG9jYWwKLmVudi50ZXN0LmxvY2FsCi5lbnYucHJvZHVjdGlvbi5sb2NhbAoKbnBtLWRlYnVnLmxvZyoKeWFybi1kZWJ1Zy5sb2cqCnlhcm4tZXJyb3IubG9nKgoKLy5pZGVhDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlVMzc4d2JsdmFuVDVYTGFkLS0NCg==";
        String message = new String(Base64.getDecoder().decode(fromProd));
        String boundary = "----WebKitFormBoundaryU378wblvanT5XLad";
        System.out.println(message);

        String separation = "--" + boundary + whitespace_charclass + "{2}";

        String part0 = ""
            + "("
            + "Content-Disposition: form-data; name=\"" + "(?<nameParam0>[^\"]+)" + "\"" + whitespace_charclass + "{2}"
            + whitespace_charclass + "{2}"
            + "(?<body0>.*?)" + whitespace_charclass + "{2}"
            + separation
            + ")?"
        ;
        String part1 = ""
            + "("
            + "Content-Disposition: form-data; name=\"" + "(?<nameParam1>[^\"]+)" + "\"" + whitespace_charclass + "{2}"
            + whitespace_charclass + "{2}"
            + "(?<body1>.*?)" + whitespace_charclass + "{2}"
            + separation
            + ")?"
        ;
        String part2 = ""
            + "("
            + "Content-Disposition: form-data; name=\"" + "(?<nameParam2>[^\"]+)" + "\"" + whitespace_charclass + "{2}"
            + whitespace_charclass + "{2}"
            + "(?<body2>.*?)" + whitespace_charclass + "{2}"
            + separation
            + ")?"
        ;
        String part3 = ""
            + "(.*"
            + "(.*"
            + "Content-Disposition: form-data; "
                + "name=\"" + "(?<nameParam3>[^\"]+)" + "\""
                + "; "
                + "filename=\"" + "(?<filenameParam3>[^\"]+)" + "\""
                + whitespace_charclass + "{2}"
            + "Content-Type: application/octet-stream" + whitespace_charclass + "{2}"
            + whitespace_charclass + "{2}"
            + "(?<body3>.*?)" + whitespace_charclass + "{2}"
            + separation
            + ")?"
            + ")"
        ;

        String epilogue = ""
            + "--"
            + whitespace_charclass + "{2}"
        ;

        String pattern = "^"
            + separation
            + part0
            + part1
            + part2
            + part3
//            + "(?<remainder>.*)"
            + epilogue
            + "$"
        ;
        Pattern regex = Pattern.compile(pattern, Pattern.DOTALL);
        Matcher matcher = regex.matcher(message);




        if (matcher.find()) {
            System.out.println("######## MATCHING #########");
            System.out.println(matcher.group("nameParam0"));
            System.out.println(matcher.group("body0"));
            System.out.println(matcher.group("nameParam1"));
            System.out.println(matcher.group("body1"));
            System.out.println(matcher.group("nameParam2"));
            System.out.println(matcher.group("body2"));
            System.out.println(matcher.group("nameParam3"));
            System.out.println(matcher.group("filenameParam3"));
            System.out.println(matcher.group("body3"));
//            System.out.println("@@@@@@@@@  remainder  @@@@@@@@@");
//            String remainder = matcher.group("remainder");
//            System.out.println(remainder);
//            System.out.println(remainder.length());
            System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            System.out.println(matcher.groupCount());
            System.out.println("######## MATCHING #########");
        } else {
            System.out.println("NO MATCH");
        }
    }
}
