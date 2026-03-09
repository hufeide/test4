"""
Harness Skill 测试示例模块

这个模块包含一些示例函数，用于测试 harness skill 的各种功能。
"""


def add(a, b):
    """
    两个数相加

    Args:
        a: 第一个数
        b: 第二个数

    Returns:
        两数之和
    """
    return a + b


def subtract(a, b):
    """
    两个数相减

    Args:
        a: 被减数
        b: 减数

    Returns:
        两数之差
    """
    return a - b


def multiply(a, b):
    """
    两个数相乘

    Args:
        a: 第一个数
        b: 第二个数

    Returns:
        两数之积
    """
    return a * b


def divide(a, b):
    """
    两个数相除

    Args:
        a: 被除数
        b: 除数

    Returns:
        两数之商

    Raises:
        ValueError: 当除数为 0 时
    """
    if b == 0:
        raise ValueError("除数不能为 0")
    return a / b


def calculate(operation, a, b):
    """
    执行基本数学运算

    Args:
        operation: 运算类型 ('add', 'subtract', 'multiply', 'divide')
        a: 第一个数
        b: 第二个数

    Returns:
        运算结果

    Raises:
        ValueError: 当运算类型无效时
    """
    operations = {
        'add': add,
        'subtract': subtract,
        'multiply': multiply,
        'divide': divide
    }

    if operation not in operations:
        raise ValueError(f"无效的运算类型：{operation}，必须是 {list(operations.keys())}")

    return operations[operation](a, b)


if __name__ == "__main__":
    # 简单测试
    print(f"2 + 3 = {add(2, 3)}")
    print(f"5 - 3 = {subtract(5, 3)}")
    print(f"4 * 3 = {multiply(4, 3)}")
    print(f"10 / 2 = {divide(10, 2)}")
    print(f"calculate('add', 2, 3) = {calculate('add', 2, 3)}")