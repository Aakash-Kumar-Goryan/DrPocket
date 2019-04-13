import sys
import wikipedia
print (wikipedia.summary(sys.argv[1], sentences=2))