import sys
import pandas as pd
import numpy as np
from nltk.stem import PorterStemmer
from nltk.stem import WordNetLemmatizer
import pickle

def col_change():
    global df_train
    df_train = pd.read_csv('TrainA.csv',delimiter=',')
    col = list(df_train.columns)
    ps = PorterStemmer()
    lemmatizer = WordNetLemmatizer()
    col_temp = [w.replace("_", " ") for w in col]
    new_column = [ps.stem(w) for w in col_temp]
    df_train.columns = new_column

def main(filt):
    #col_change()
    global df_train,clf,clf2
    df_train = pd.read_csv('TrainA.csv',delimiter=',')
    l = [0]*132
    for symt in filt:
        index = list(df_train.columns==symt).index(True)
        l[index] = 1
    l = [l]
    with open('model_full.pkl', 'rb') as fid:
        clf = pickle.load(fid)
    first_disease = clf.predict(l)
    with open('model_'+ first_disease[0] +'.pkl', 'rb') as fid2:
            clf2 = pickle.load(fid2)
    second_disease = clf2.predict(l)
    print('On the basis of above Symptoms similar diseases found are: \n'+first_disease[0] + ', ' + second_disease[0])

#start process
if __name__ == '__main__':
    try:
        import simplejson as json
    except (ImportError,):
        import json
    result = json.loads(sys.argv[1])
    main(result)