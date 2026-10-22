from django.db import models


class Calculation(models.Model):
    """One step saved in the calculator's memory, e.g. "2.5 × 4 = 10"."""

    expression = models.CharField(max_length=200)
    result = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']   # newest first

    def __str__(self):
        return f'{self.expression} = {self.result}'
