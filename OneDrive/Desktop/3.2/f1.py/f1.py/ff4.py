n=int(input())
s=int(input())
lis=list(map(int,input().split()))
bus=0
c=0
for i in range(n):
   if c+lis[i]<=s:
       c+=lis[i]
   else:
       bus+=1
       c=lis[i]
if c>0:
    bus+=1
print(bus)           
               