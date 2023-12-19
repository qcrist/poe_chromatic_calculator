import java.time.Duration;
import java.time.Instant;
import java.util.Random;

public class simsocket {

    private static final int RED = 1;
    private static final int GREEN = 2;
    private static final int BLUE = 3;

    private static final String LETTER_MAP = "@RGB";

    public static int sim_hit(int n, int at, double chr, double chrg, Random rand) {
        int result = 0;
        for (int i = 0; i < n; i++) {
            double read = rand.nextDouble();
            int val;
            if (read < chr) {
                val = RED;
            } else if (read < chrg) {
                val = GREEN;
            } else {
                val = BLUE;
            }
            result = result * 16 + val;
        }
        if (result == at)
            return sim_hit(n, at, chr, chrg, rand);
        return result;
    }

    public static String numToRGB(int num) {
        StringBuilder res = new StringBuilder();
        while (true) {
            int read = num & 0xF;
            if (read == 0) break;
            res.append(LETTER_MAP.charAt(read));
            num = num / 16;
        }
        return res.toString();
    }

    public static void main(String[] args) {
        Random r = new Random(0);
        int[] counts = new int[0x333 + 1];
        int hits = 50_000_000;
        Instant start = Instant.now();
        int goal = 0x333;
        System.out.printf("Goal: %s\n", numToRGB(goal));
        double p1 = 0.825;
        double p2 = 0.825 + 0.0875;
        int n = 3;
        int at = sim_hit(n, -1, p1, p2, r);
        for (int i = 0; i < hits; i++) {
            do {
                at = sim_hit(n, at, p1, p2, r);
            } while (at == goal);
            counts[at]++;
        }
        System.out.printf("Took %dms\n", Duration.between(start, Instant.now()).toMillis());
        for (int i = 0; i < counts.length; i++) {
            if (counts[i] > 0) {
                System.out.printf("%s: %05.02f%%\n",
                        numToRGB(i), counts[i] * 100d / hits);
            }
        }
    }

//    public static void main(String[] args) {
//        Random r = new Random();
//        int[] counts = new int[0x33 + 1];
//        int[] countsG = new int[0x33 + 1];
//        int hits = 50_000_000;
//        Instant start = Instant.now();
//        int goal = 0x33;
//        System.out.printf("Goal: %s\n", numToRGB(goal));
//        for (int i = 0; i < hits; i++) {
//            int res = sim_hit(2, -1, 0.825, 0.825 + 0.0875, r);
//            counts[res]++;
//            int next = sim_hit(2, res, 0.825, 0.825 + 0.0875, r);
//            if (next == goal)
//                countsG[res]++;
//        }
//        System.out.printf("Took %dms\n", Duration.between(start, Instant.now()).toMillis());
//        for (int i = 0; i < counts.length; i++) {
//            if (counts[i] > 0) {
//                System.out.printf("%s: %05.02f%% %05.02f%% %05.02f%%\n",
//                        numToRGB(i), counts[i] * 100d / hits, 100d * countsG[i] / counts[i]);
//            }
//        }
//    }
}
