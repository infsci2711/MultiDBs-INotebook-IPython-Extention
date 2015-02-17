import pymysql

#conn = pymysql.connect(host='127.0.0.1', unix_socket='/tmp/mysql.sock', user='root', passwd=None, db='mysql')

# read json file from database.json


# initial all the database connection
MySQL = pymysql.connect(host='127.0.0.1', port=3306, user='root', passwd='12345', db='salesSystemDB')



from IPython.display import Javascript
Javascript("var cur = "+cur)
