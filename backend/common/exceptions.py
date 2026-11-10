import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import DatabaseError

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardized luxury API error response handler.
    """
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            'success': False,
            'status_code': response.status_code,
            'errors': response.data
        }
        return response

    # Catch database connection or unhandled exceptions
    if isinstance(exc, DatabaseError):
        logger.error(f"Database operation failed: {exc}", exc_info=True)
        return Response({
            'success': False,
            'status_code': status.HTTP_503_SERVICE_UNAVAILABLE,
            'errors': {
                'detail': 'Database connection error. Please verify the Neon PostgreSQL connection string.'
            }
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return Response({
        'success': False,
        'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'errors': {
            'detail': 'An unexpected server error occurred.'
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
