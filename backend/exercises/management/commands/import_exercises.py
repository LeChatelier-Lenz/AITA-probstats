import csv
from django.core.management.base import BaseCommand
from exercises.models import Exercise


class Command(BaseCommand):
    help = "从 CSV 文件批量导入练习题数据"

    def add_arguments(self, parser):
        parser.add_argument(
            '--path',
            type=str,
            required=True,
            help='CSV 文件路径，例如：--path data/exercises.csv'
        )

    def handle(self, *args, **options):
        csv_path = options['path']
        exercises = []

        self.stdout.write(self.style.WARNING(f"正在读取文件：{csv_path}"))

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader)  # 第一行是标题 ['question','answer','difficulty','topic']

            for row in reader:
                # 确保至少有四列
                if len(row) < 4:
                    continue

                question = row[0].strip()
                answer = row[1].strip()
                difficulty = row[2].strip() if row[2].strip() in ['easy', 'medium', 'hard'] else 'medium'
                category = row[3].strip() if row[3].strip() else '未分类'

                exercises.append(Exercise(
                    question=question,
                    answer=answer,
                    difficulty=difficulty,
                    category=category
                ))

        if exercises:
            Exercise.objects.bulk_create(exercises)
            self.stdout.write(self.style.SUCCESS(f"成功导入 {len(exercises)} 条练习题数据"))
        else:
            self.stdout.write(self.style.WARNING("未发现可导入的数据"))
