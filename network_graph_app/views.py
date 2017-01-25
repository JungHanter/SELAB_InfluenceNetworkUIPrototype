__author__ = 'hanter'

from django.shortcuts import render
import logging, json, time, copy
from pprint import pprint


logging.basicConfig(
    format="[%(name)s][%(asctime)s] %(message)s",
    handlers=[logging.StreamHandler()],
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def main_page(request):
    return render(request, 'network_graph/main.html')
