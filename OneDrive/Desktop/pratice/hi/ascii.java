public class ascii {
 public  static String bom(String r){
    StringBuilder result=new StringBuilder();
     
    for (int i=0;i<=r.length()-1;i++){
            char j=r.charAt(i);
            if(j>='a' && j<='z'){
            j =(char) (j-32);
            }
         result.append(j);
    }
   return result.toString(); 
}
    static void main(String[] args){
        char c;
        char a=65;
        System.out.println(a);
        String r="hello nadh";
        String n=bom(r);
      System.out.println(n);
        
    }
    
}
