import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

public class simsocket_raw {

    public static void main(String[] args) {

        int goal = 0x3333;
        double p1 = 0.825;
        double p2 = 0.825 + 0.0875;
        int n = 4;

        Instant start = Instant.now();
        try (
                ExecutorService pool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors())) {
            double[] results;
            results = IntStream.range(0, 100)
                    .mapToObj(i ->
                            CompletableFuture.supplyAsync(() -> {
                                long sum = 0;
                                int count = 10000;
                                ThreadLocalRandom rnd = ThreadLocalRandom.current();
                                for (int attempt = 0; attempt < count; attempt++) {
                                    int at = -1;
                                    while (at != goal) {
                                        at = simsocket.sim_hit(n, at, p1, p2, rnd);
                                        sum++;
                                    }
                                }

                                return (double) sum / count;
                            }, pool)).toList().stream()
                    .map(CompletableFuture::join).mapToDouble(i -> i).toArray();
//            for (double result : results) {
//                System.out.println(result);
//            }
            System.out.println(Arrays.stream(results).summaryStatistics().getAverage());
        }
        System.out.printf("Took %dms\n", Duration.between(start, Instant.now()).toMillis());

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
