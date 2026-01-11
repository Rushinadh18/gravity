public class war {

  public static  int solution(int num) {
    int sum=0;
    for(int i=num;i<10;i++){
    if(i%3==0 || i%5==0){
      sum+=i;
    }
    else if(i<0){
      sum+=0;
    }
    
  }
   return sum;
  }
  static void main(String[] args){
    int bio=solution(2);
    System.out.println(bio);
  }
}
    

