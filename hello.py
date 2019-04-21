import pickle
import sys
with open('my_dumped_classifier.pkl', 'rb') as fid:
    gnb_loaded = pickle.load(fid)
Angiography = ['< 50% diameter narrowing','> 50% diameter narrowing','second','Third','Fourth']
li = [[float(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5]),float(sys.argv[6]),float(sys.argv[7]),float(sys.argv[8]),float(sys.argv[9]),float(sys.argv[10]),float(sys.argv[11])]]
print('Prediction: ' + Angiography[gnb_loaded.predict(li)[0]])