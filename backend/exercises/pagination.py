from rest_framework.pagination import PageNumberPagination


class ExercisePagination(PageNumberPagination):
    """
    练习题分页配置：固定每页数量，支持通过 `?page=` 指定页码。
    如需前端可控每页数量，可开放 page_size_query_param。
    """
    page_size = 10  # 固定每页 10 条
    page_query_param = 'page'
    # 如果想让前端控制每页数量，可取消下方注释
    # page_size_query_param = 'page_size'
    # max_page_size = 100
