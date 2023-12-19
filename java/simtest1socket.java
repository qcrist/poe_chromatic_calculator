import java.util.*;
import java.util.stream.IntStream;

public class simtest1socket {

    private static ThreadLocal<Random> thr = ThreadLocal.withInitial(Random::new);

    private static int sim() {
        Random r = thr.get();
//        double pCommonFail = 0.8464285714285715;
//        double pRareFail = 0.07678571428571429;
        double blueSucc = 0.0831721470019342;
//        double cBlue = pCommonFail + pRareFail;
//        boolean isRed = r.nextDouble() < 0.8464285714285715;
        boolean isRed = r.nextBoolean();
        for (int i = 1; ; i++) {
            if (isRed) {
                if (r.nextBoolean())
                    return i;
                isRed = false;
            } else {
                if (r.nextDouble() < blueSucc) {
                    return i;
                }
                isRed = true;
            }
        }
    }


    public static void main(String[] args) {
        List<Double> found = new ArrayList<>();
        for (int pp = 0; pp < 10; pp++) {
            double z = IntStream.range(0, 1_000_000)
                    .parallel()
                    .map(i -> sim()).average().orElseThrow();
            found.add(z);
            System.out.println("z = " + z);
        }
        DoubleSummaryStatistics sum = found.stream().mapToDouble(d -> d).summaryStatistics();
        System.out.println("sum.getAverage() = " + sum.getAverage());
        double range = sum.getMax() - sum.getMin();
        System.out.printf("range = %.02f\n", range);
        System.out.println("1/sum.getAverage() = " + 1/sum.getAverage());

//        System.out.println("1/ = " + 1 / z.getAsDouble());
    }
}
