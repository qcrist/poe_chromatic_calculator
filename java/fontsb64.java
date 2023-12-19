import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

public class fontsb64 {
    public static void main(String[] args) throws IOException {
        for (Path f : Files.list(Path.of("fonts")).toList()) {
            byte[] data = Files.readAllBytes(f);
            String format = """
                    @font-face {
                        font-family: "%s";
                        font-weight: normal;
                        font-style: normal;
                        src: url(data:application/x-font-woff;charset=utf-8;base64,%s) format("woff")
                    }
                    """;
            String b64 = Base64.getEncoder().encodeToString(data);
            System.out.printf(format, f.getFileName(), b64);
        }
    }
}
