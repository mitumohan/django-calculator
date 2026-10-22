from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from .engine import CalculationError, evaluate, format_number
from .models import Calculation

MEMORY_SIZE = 20


def history_as_list():
    return [
        {'expression': c.expression, 'result': c.result}
        for c in Calculation.objects.all()[:MEMORY_SIZE]
    ]


def index(request):
    return render(request, 'calc/index.html', {'history': history_as_list()})


@require_POST
def calculate(request):
    expression = request.POST.get('expression', '')
    try:
        result = format_number(evaluate(expression))
    except CalculationError as error:
        return JsonResponse({'error': str(error)}, status=400)

    Calculation.objects.create(expression=expression, result=result)
    return JsonResponse({'result': result, 'history': history_as_list()})


@require_POST
def clear_memory(request):
    Calculation.objects.all().delete()
    return JsonResponse({'history': []})
