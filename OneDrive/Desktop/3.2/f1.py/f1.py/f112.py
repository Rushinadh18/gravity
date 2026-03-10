class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def hi(head):
    currentNode = head
    while currentNode:
        print(currentNode.data, end=" ")
        currentNode = currentNode.next


node1 = Node(1)
node2 = Node(2)
node3 = Node(4)
node4 = Node(8)

node1.next = node2
node2.next = node3
node3.next = node4

hi(node1)