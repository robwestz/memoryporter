"""
Pydantic v1 compatibility patch for Python 3.14+

Python 3.14 (PEP 649) defers annotation evaluation. During metaclass __new__,
namespace['__annotations__'] is empty — annotations only materialise after
the class object exists. Pydantic v1's ModelMetaclass reads annotations
during __new__, finds nothing, and crashes with:

    ConfigError: unable to infer type for attribute "..."

Fix: after detecting an empty annotation dict on Python 3.14+, build a
temporary class to force annotation materialisation, then read them back.

This patch is idempotent and only activates on Python >= 3.14.
Import this module BEFORE importing chromadb or any pydantic.v1 model.
"""

import sys

if sys.version_info >= (3, 14):
    try:
        from pydantic.v1 import main as _pv1_main

        _original_new = _pv1_main.ModelMetaclass.__new__

        def _patched_new(mcs, name, bases, namespace, **kwargs):
            raw = namespace.get("__annotations__", {})
            if not raw:
                try:
                    _tmp = type.__new__(mcs, name, bases, namespace, **kwargs)
                    materialized = _tmp.__annotations__.copy()
                    if materialized:
                        namespace["__annotations__"] = materialized
                except Exception:
                    pass
            return _original_new(mcs, name, bases, namespace, **kwargs)

        _pv1_main.ModelMetaclass.__new__ = _patched_new
    except Exception:
        pass  # pydantic not installed or incompatible — skip silently
