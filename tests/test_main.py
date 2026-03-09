"""
测试 main.py 中的函数
"""
import pytest
import sys
from pathlib import Path

# 添加 src 目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from main import add, subtract, multiply, divide, calculate


class TestAdd:
    """测试 add 函数"""

    def test_add_positive_numbers(self):
        """测试正数相加"""
        assert add(2, 3) == 5
        assert add(10, 20) == 30

    def test_add_negative_numbers(self):
        """测试负数相加"""
        assert add(-1, -1) == -2
        assert add(-5, -10) == -15

    def test_add_mixed_numbers(self):
        """测试正负数相加"""
        assert add(5, -3) == 2
        assert add(-5, 3) == -2

    def test_add_zero(self):
        """测试与零相加"""
        assert add(0, 5) == 5
        assert add(5, 0) == 5


class TestSubtract:
    """测试 subtract 函数"""

    def test_subtract_positive_numbers(self):
        """测试正数相减"""
        assert subtract(5, 3) == 2
        assert subtract(10, 20) == -10

    def test_subtract_negative_numbers(self):
        """测试负数相减"""
        assert subtract(-5, -3) == -2

    def test_subtract_zero(self):
        """测试与零相减"""
        assert subtract(5, 0) == 5
        assert subtract(0, 5) == -5


class TestMultiply:
    """测试 multiply 函数"""

    def test_multiply_positive_numbers(self):
        """测试正数相乘"""
        assert multiply(2, 3) == 6
        assert multiply(4, 5) == 20

    def test_multiply_negative_numbers(self):
        """测试负数相乘"""
        assert multiply(-2, -3) == 6
        assert multiply(-2, 3) == -6

    def test_multiply_by_zero(self):
        """测试乘以零"""
        assert multiply(5, 0) == 0
        assert multiply(0, 5) == 0


class TestDivide:
    """测试 divide 函数"""

    def test_divide_positive_numbers(self):
        """测试正数相除"""
        assert divide(6, 2) == 3
        assert divide(10, 2) == 5

    def test_divide_negative_numbers(self):
        """测试负数相除"""
        assert divide(-6, -2) == 3
        assert divide(-6, 2) == -3

    def test_divide_by_zero(self):
        """测试除以零应抛出异常"""
        with pytest.raises(ValueError):
            divide(5, 0)


class TestCalculate:
    """测试 calculate 函数"""

    def test_calculate_add(self):
        """测试 calculate 的 add 运算"""
        assert calculate('add', 2, 3) == 5

    def test_calculate_subtract(self):
        """测试 calculate 的 subtract 运算"""
        assert calculate('subtract', 5, 3) == 2

    def test_calculate_multiply(self):
        """测试 calculate 的 multiply 运算"""
        assert calculate('multiply', 4, 3) == 12

    def test_calculate_divide(self):
        """测试 calculate 的 divide 运算"""
        assert calculate('divide', 10, 2) == 5

    def test_calculate_invalid_operation(self):
        """测试无效的运算类型"""
        with pytest.raises(ValueError):
            calculate('invalid', 2, 3)