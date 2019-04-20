import numpy as np
import pandas as pd
import sys

def helper_function(latitude,longitude):
    global data
    data=pd.read_csv("nin-health-facilities.csv", encoding = "ISO-8859-1")
    dict={}
    num_hospitals=3
    for i in range(len(data)):
        lat=data.iloc[i][8]
        long=data.iloc[i][9]
        if(lat=='\\N' or long=='\\N'):
            continue
        lat=float(lat)
        long=float(long)
        dict[i]=((lat-latitude)*(lat-latitude))+((long-longitude)*(long-longitude))
    sorted_dict=sorted(dict.items(), key = lambda kv:(kv[1], kv[0]))
    count=0
    temp=[]
    for i in sorted_dict:
        temp.append(i[0])
        count +=1
        if(count==num_hospitals):
            break
    return temp

def main(latitude,longitude):
    output_str=""
    temp=helper_function(latitude,longitude)
    global data
    for i in range(len(temp)):
        output_str +="Health Facility Name : "
        output_str +=str(data.iloc[temp[i]][1])
        output_str += "  \n"
        output_str +="Address : "
        output_str +=str(data.iloc[temp[i]][2])
        output_str += "  \n"
        output_str +="Street : "
        output_str +=str(data.iloc[temp[i]][3])
        output_str += "  \n"
        #output_str +="Landmark : "
        #output_str +=str(data.iloc[temp[i]][4])
        #output_str += "  \n"
        output_str +="Locality : "
        output_str +=str(data.iloc[temp[i]][5])
        output_str += "  \n"
        output_str +="Pincode : "
        output_str +=str(data.iloc[temp[i]][6])
        output_str += "  \n"
        output_str +="Landline Number : "
        output_str +=str(data.iloc[temp[i]][7])
        output_str += "  \n"
        output_str += "  \n"
    print(output_str)

#start process
if __name__ == '__main__':
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    #print(latitde,'\n', longitude)
    main(latitude,longitude)