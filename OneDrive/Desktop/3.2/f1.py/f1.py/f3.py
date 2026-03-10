
    #in bus top queue and every 30 min an empty busa t bus stop it can carry
     #atmost m people in it
     #each gropu has a[i] people and not that the order of queue changes if some group can't wait for all of its members in current bus thant it for the wait next bus.
     #write the program to print the number of buses  require to transport all n groups to jeeju island
     #sample input=3
     
     #space seprated 2,3,2,1
     #space no bguses reqiore is 
     # bus capacity
m = int(input())


groups = list(map(int, input().split()))

buses = 0
current = 0

for g in groups:
    if current + g <= m:
        current += g
    else:
        buses += 1
        current = g

if current > 1:
    buses += 1

print(buses)