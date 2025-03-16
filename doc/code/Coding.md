# Our Coding Style

Here, you can find all the information necessary of our coding style  
Read through this thoroughly so that you may write acceptable code.  
have fun!!!

## Documenting style

we use Doxygen to generate our documentation, meaning  we use three comment styles. The last two are specific ways for documenting in Doxygen-style for Javascript and python:

Javadoc-style (Most common): this is the comment style used in Java  
e.g:

```c++
/**
 * @brief A brief description.
 * 
 * Detailed description here.
 * @param x Input parameter.
 * @return Output value.
 */
int func(int x);
```

Qt-style: stems from Qt-projects  
e.g:

```c++
/*!
 * \brief A brief description.
 * 
 * Detailed description here.
 * \param x Input parameter.
 * \return Output value.
 */
int func(int x);
```

Triple Slash: used in Qt-projects  
e.g:

```c++
/// @brief A brief description.
/// 
/// Detailed description here.
/// @param x Input parameter.
/// @return Output value.
int func(int x);
```

Javascript: Doxygen-style comment in Js  
e.g:

```js
/**
 * @class MyClass
 * @brief A sample JavaScript class documented with Doxygen.
 */
class MyClass {
    /**
     * @brief Constructor.
     * @param {number} value - Initial value.
     */
    constructor(value) {
        this.value = value;
    }

    /**
     * @brief Compute the square of a number.
     * @param {number} x - Input number.
     * @return {number} Square of `x`.
     */
    static square(x) {
        return x ** 2;
    }
}
```

Python: Doxygen-style comment in Py  
e.g:

```py
## @class MyClass
#  @brief A sample Python class documented with Doxygen.
class MyClass:
    ## @brief Constructor.
    #  @param value Initial value.
    def __init__(self, value):
        self.value = value

    ## @brief Compute the square of a number.
    #  @param x Input number.
    #  @return Square of `x`.
    #  @note This is a static method.
    @staticmethod
    def square(x):
        return x ** 2
```

or  

```py
def func():
    """! 
    @brief A function documented with Doxygen.
    @details This is a detailed description.
    """
```

## [Testing style](./Testing.md)

This is the spefication of our approach to writing testing code;  
and also the types of test we should make.

## [Coding Principles](./Coding_Principles.md)

These are generally to be followed:

1. only break in some execption  
2. almost always ask for review if broken.

## [Defintion of Done (DoD)](./DOD.md)

following this link, you will find a list of qualifiers:  
these define what we understand as 'done' in our project.  
__ALWAYS AND I SAY ALWAYS RESPECT THESE QAULIFIERS__
