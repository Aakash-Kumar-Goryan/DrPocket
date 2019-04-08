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
    col_change()
    if 'clf' not in globals():
        global clf
        with open('Symptoms_classifer.pkl', 'rb') as fid:
            clf = pickle.load(fid)
    ps = PorterStemmer()
    filt = [w.replace("_", " ") for w in filt]
    filt = [ps.stem(w) for w in filt]
    # print(filt)
    l = [0]*132
    global df_train
    for symt in filt:
        index = list(df_train.columns==symt).index(True)
        l[index] = 1
    l = [l]
    print(clf.predict(l)[0],end="")

#start process
if __name__ == '__main__':
    try:
        import simplejson as json
    except (ImportError,):
        import json
    result = json.loads(sys.argv[1])
    #print(type(result))
    #print(result)
    main(result)