import org.ejml.data.DMatrixRMaj;
import org.ejml.simple.SimpleEVD;
import org.ejml.simple.SimpleMatrix;

public class markov {
    public static void main(String[] args) {
        DMatrixRMaj input = new DMatrixRMaj(3, 1);
        input.fill(1 / 3d);

        DMatrixRMaj transition = new DMatrixRMaj(3, 3);
        transition.set(0, 0, 0);
        transition.set(1, 1, 0);
        transition.set(2, 2, 0);

        double key_prob_red = 0.825;
        double key_prob_gb = 0.0875;

//        obj[dstKey] += iter[srcKey] * key_prob[dstKey] / (1 - key_prob[srcKey]);

        transition.set(0, 1, key_prob_red / (1 - key_prob_gb));
        transition.set(0, 2, key_prob_red / (1 - key_prob_gb));

        transition.set(1, 0, key_prob_gb / (1 - key_prob_red));
        transition.set(1, 2, key_prob_gb / (1 - key_prob_gb));

        transition.set(2, 0, key_prob_gb / (1 - key_prob_red));
        transition.set(2, 1, key_prob_gb / (1 - key_prob_gb));

        System.out.println("input = " + input);
        System.out.println("transition = " + transition);

        SimpleMatrix tm = new SimpleMatrix(transition);
        SimpleMatrix im = new SimpleMatrix(input);

        SimpleMatrix res = tm.mult(tm.mult(im));
        System.out.println(res);

        SimpleMatrix tmp = tm;
        for (int i = 0; i < 20; i++)
            tmp = tmp.mult(tmp);

        System.out.println("tmp = " + tmp);

        SimpleMatrix res2 = tmp.mult(im);
        System.out.println(res2);

        SimpleEVD<SimpleMatrix> eig = tm.eig();

        System.out.println("eig.getEigenvalues() = " + eig.getEigenvalues());
        for (int i = 0; i < eig.getNumberOfEigenvalues(); i++) {
            System.out.printf("%d: %s\n", i, eig.getEigenVector(i));
        }

//        eig.get

//        System.out.println();
    }
}
