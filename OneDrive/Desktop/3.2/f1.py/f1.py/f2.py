n=int(input())                                   
c=0
while n>1:
    c+=1
    if(n%2==0):
        n=n//2
        print(n,end=" ")
    else:
        n=n*3+1
        print(n,end=" ")
print(c)        