from rest_framework.pagination import PageNumberPagination

class StandardResultsPagination(PageNumberPagination):
    """Default: 12 items/page, max 100."""
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100

class LargeResultsPagination(PageNumberPagination):
    """Gallery: 24 items/page."""
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 200
