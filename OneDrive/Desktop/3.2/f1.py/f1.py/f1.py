s=int(input())
p=int(input())
bf=int(input())
if bf<=s*p or bf>=s*p:
    if(bf<=s or bf%s==1 or bf%s==0):
        print("yes")
    else:
        print("no")    
 