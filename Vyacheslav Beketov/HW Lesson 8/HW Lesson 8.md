## 1. Продумать, где можно применить замыкания для практикума из седьмого урока.

Для создания защищенных переменных классов, к которым невозможно получить доступ из вне.

## 2. Ответы на задание в комментариях 

a.
```
if (!("a" in window)) {
    var a = 1;
}
alert(a);

// Всплывающее окно с 1 (a=1), т.к. в глобальном объекте window нет свойства «a»
```

b.	
```var b = function a(x) {
    x && a(--x);
};
alert(a);
//выведет определение функции a
```

c.	
```
function a(x) {
    return x * 2;
}
var a;
alert(a);
//undefined, т.к. var a не присвоено значение
```

d.	
```function b(x, y, a) {
    arguments[2] = 10;
    alert(a);
}
b(1, 2, 3);
//10 – значение треьего аргумента функции изменяется внутри b()
```
