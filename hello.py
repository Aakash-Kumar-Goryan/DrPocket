import pickle
import sys
with open('my_dumped_classifier.pkl', 'rb') as fid:
    gnb_loaded = pickle.load(fid)

#print("Age: " + sys.argv[1])
#print("cp: " + sys.argv[3])
#print("trestbps: " + sys.argv[4])
#print("chol: " + sys.argv[5])
#print("fbs: " + sys.argv[6])
#print("restecg: " + sys.argv[7])
#print("thalach: " + sys.argv[8])
#print("exang: " + sys.argv[9])
#print("oldpeak: " + sys.argv[10])
#print("slope: " + sys.argv[11])
print('Prediction: ')
li = [[float(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5]),float(sys.argv[6]),float(sys.argv[7]),float(sys.argv[8]),float(sys.argv[9]),float(sys.argv[10]),float(sys.argv[11])]]
print(gnb_loaded.predict(li)[0])