import java.awt.*;
import java.awt.datatransfer.*;
import java.io.IOException;
import java.time.Duration;

public class clipboard_connector {

    public static void chkClipboard(Clipboard cc) throws IOException, UnsupportedFlavorException {
        DataFlavor STRING = DataFlavor.stringFlavor;
        if (!cc.isDataFlavorAvailable(STRING))
            return;
        String data = cc.getData(STRING).toString();
        System.out.println(data);
        cc.setContents(new StringSelection(data), null);
    }

    public static void main(String[] args) throws IOException, UnsupportedFlavorException, InterruptedException {
        Clipboard cc = Toolkit.getDefaultToolkit().getSystemClipboard();
        chkClipboard(cc);
        cc.addFlavorListener(unused -> {
            try {
                chkClipboard(cc);
            } catch (IOException | UnsupportedFlavorException e) {
                throw new RuntimeException(e);
            }
        });
        while (!Thread.interrupted())
            Thread.sleep(Duration.ofDays(999));
    }
}
