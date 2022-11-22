package ai.explicable.forms;

import org.javafp.parsecj.input.Input;

import java.util.Base64;

import static org.javafp.parsecj.Combinators.*;
import static org.javafp.parsecj.Text.*;

public class Tests {
    public static void main(String[] args) throws Exception {

        String fromProd = "LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpmZmRmZA0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJlbWFpbCINCg0KZmZmQGRkLmNvbQ0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5VTM3OHdibHZhblQ1WExhZA0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJteUZpbGUiOyBmaWxlbmFtZT0iLmdpdGlnbm9yZSINCkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtDQoNCiMgU2VlIGh0dHBzOi8vaGVscC5naXRodWIuY29tL2FydGljbGVzL2lnbm9yaW5nLWZpbGVzLyBmb3IgbW9yZSBhYm91dCBpZ25vcmluZyBmaWxlcy4KCiMgZGVwZW5kZW5jaWVzCi9ub2RlX21vZHVsZXMKLy5wbnAKLnBucC5qcwoKIyB0ZXN0aW5nCi9jb3ZlcmFnZQoKIyBwcm9kdWN0aW9uCi9idWlsZAoKIyBtaXNjCi5EU19TdG9yZQouZW52LmxvY2FsCi5lbnYuZGV2ZWxvcG1lbnQubG9jYWwKLmVudi50ZXN0LmxvY2FsCi5lbnYucHJvZHVjdGlvbi5sb2NhbAoKbnBtLWRlYnVnLmxvZyoKeWFybi1kZWJ1Zy5sb2cqCnlhcm4tZXJyb3IubG9nKgoKLy5pZGVhDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlVMzc4d2JsdmFuVDVYTGFkLS0NCg==";
        String message = new String(Base64.getDecoder().decode(fromProd));
        String boundary = "----WebKitFormBoundaryU378wblvanT5XLad";
        System.out.println(message);

//                    .then(satisfy((Character c) -> {
//                        System.out.println("'" + c + "'");
//                        System.out.println("" + (int)c);
//                        System.out.println(Character.isWhitespace(c));
//                        return Character.isWhitespace(c);}).label("plop"))
//                    .then(wspace.optional()).skipMany()

//        var multipart =
//                string("--")
//                    .then(string(boundary))
//                    .then(wspace.count(2))
//                    .then(string("Content-Disposition: form-data; name="))
//                    .then(strBetween(chr('"'), chr('"')).bind(
//                        name ->
//                            wspace
//                                .count(4)
//
//                                .bind(
//                                    body ->
//                                        string("--")
//                                            .then(string(boundary))
//                                )
//                                .then(eof())
//
////                                retn(name)
//
//                    ))
//                    .then(eof())
//                ;
        var multipart =
            string("--")
                .bind(body -> retn(body))
                .then(eof())
            ;

        var result = multipart.parse(Input.of(message)).getResult();

        System.out.println("#################");
        System.out.println(result);
    }
}
