import sys
import wikipedia
print(sys.argv[1])
if(sys.argv[1] == 'GERD'):
    print (wikipedia.summary('Gastroesophageal reflux disease', sentences=2))
else:
    print (wikipedia.summary(sys.argv[1], sentences=2))