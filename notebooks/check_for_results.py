#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    Vérification des résultats chaque 15 secondes
    Peut être couplé à une alerte e-mail / SMS
"""


import pandas as pd
import urllib.request
import json
import requests
from time import sleep

####
# Ch
####

BASEURL = 'https://www.ge.ch/elections/20180415/'

lastLot = {'CE': False,
        'GC': False}
lotUpdated = {'CE': False,
             'GC': False}

def getJson(_response):
    if not response.ok:
        print('http error', response.status_code)
        return False
    try:
        data = _response.json()
        return data
    except ValueError as e:
        print('Error: ', e)
        return False

alert = False

while alert == False:
    for conseil in ['CE', 'GC']: # remove 'GC' here for second round
        print('Checking results for', conseil, '...')
        response = requests.get(BASEURL + conseil + '/datas/gevi_param.json')
        lot_data = getJson(response)
        print(lot_data)
        if lot_data:
            if lot_data['displayResults'] == False:
                print(lot_data['msg'])
            else:
                # Get previous param data
                with open(conseil + '-lot.json', 'r') as infile:
                    previousData = json.load(infile)
                    print('Lot: {} / previously: {}'.format(lot_data['noLot'], previousData['noLot']))
                if lot_data['noLot'] == previousData['noLot']:
                    print('Lot number didn’t change – terminating.')
                else:
                    print('Data was updated: lot {} vs lot {}'.format(lot_data['noLot'], previousData['noLot']))
                    alert = True

                    lastLot[conseil] = lot_data['noLot']
                    lotUpdated[conseil] = True

                    # Save new param data
                    with open(conseil + '-lot.json', 'w') as outfile:
                        json.dump(lot_data, outfile)
    sleep(15)
