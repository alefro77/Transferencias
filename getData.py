import urllib2
from bs4 import BeautifulSoup
import re
import csv
import unicodedata


numerics = re.compile(r'[^\d\,\.]')



url = ["https://www.transfermarkt.com/transfers/transferrekorde/statistik?saison_id=",
        "land_id&land_id=0&ausrichtung=&spielerposition_id=&altersklasse=&leihe=&w_s=&plus=1&page="]

li = []



def openpage(page):
    opener = urllib2.build_opener()
    opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
    page = opener.open(page)
    soup = BeautifulSoup(page, 'html.parser')
    return soup

def scrapeleague(link, year):
    soup = openpage(link);
    table = soup.find('table', {'class':'items'})

    for tr in table.find_all('tr'):
        tds = tr.find_all('td')
        if len(tds) > 2:
            number = tds[0].text
            nombre = tds[3].text
            edad = tds[5].text
            valor = numerics.sub('', tds[6].text)
            year = year
            teamFrom = tds[11].text
            leagueFrom = tds[12].text
            teamTo = tds[15].text
            leagueTo = tds[16].text
            totalCost = numerics.sub('', tds[17].text).replace(",",".")
            obj = [number, nombre, edad, teamTo, teamFrom, leagueTo, leagueFrom, totalCost, unicode(year)]
            li.append(obj)

    print 'Done'

for j in range (2005, 2018):
    for t in range (1,11):
        pagComplete = url[0] +  str(j) + url[1] + str(t)
        print "scrapping: "+ pagComplete
        scrapeleague(pagComplete, j)

f = open ("kkfinal.csv", "a")
f.write("numero,nombre,edad, teamTo, teamFrom, leagueTo,leagueFrom,totalCost, year\n")
f.close()

for i in li:
    lon = len(i) - 1
    z = 0
    f = open ("kkfinal.csv", "a")
    for k in i:
        let = ''.join((c for c in unicodedata.normalize('NFD', k) if unicodedata.category(c) != 'Mn'))
        try:
            f.write(u' '.join([l.strip() for l in let.splitlines() if l.strip()]))
        except:
            f.write("empty")    
        if z < lon:
            f.write(",")
        else:
            f.write("\n")
        z+=1    




