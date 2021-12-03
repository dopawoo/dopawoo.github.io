## JsonToFile

JsonToFile 可以根据JSON生成相应的Model文件。



[立刻在线试一试](https://dopawoo.github.io/pages/tools-page/JsonToFile/index.html)



#### 下载该项目并解压，用浏览器打开index.html即可使用。

## 示例

例如能够根据JSON

> {"name" : "", "age" : 17}

生成Swift内容

> ```swift
> //
> //  LSModel.swift
> //  vfun
> 
> //  Created by WP on 2020/6/11.
> //  Copyright © 2020 dopa. All rights reserved.
> //
> 
> import UIKit
> 
> class LSModel {
> 
>     var name: String = "";
>     var age: Int?;
> 
> }
> ```



并且能够下载生成的文件。



#### 静态图

![示例图片](https://github.com/dopawoo/JsonToFile/blob/master/readme-img/example-static.png)

#### 动态图

![示例图片](https://github.com/dopawoo/JsonToFile/blob/master/readme-img/example.gif)

## 支持语言

支持语言：`Objective-C`、`Swift`和`Java `。

**注意：由于本人对Java不是很熟悉，也许Java语法有误，可以联系我，或者自行修改。**

你也可以模仿示例为其他语言生成文件。

## 使用说明

#### 下载该项目并解压，用浏览器打开index.html即可使用。

1.选择对应语言；

2.左侧输入框 输入正确格式的JSON；

3.右侧各个输入框修改对应的Class名称；

4.下载文件。

**注意事项：切换语言或者修改左侧输入JSON时，右侧的所有Class名称都会重置为默认。**

## 设置

**在language-config.js文件中修改对应语言的设置。**

**不同语言的设置不尽相同。**

| 参数名称 | 参数说明 | 示例 | 是否能修改 |
| ------- |:-------:|:--------:|:--------:|
| langueName | 语言名称 | | 不建议修改 |
| defaultParentClass | 默认父类|  | √ |
| defaultImportText | 默认的导入文件信息 | | √ |
| defaultParentClass | 默认父类 | | √ |
| defineStartText | Objective-C对Swift的宏，其他语言忽略 | | √ |
| defineEndText | Objective-C对Swift的宏，其他语言忽略 | | √ |
| modelNameHeader | 默认model名字的前边部分 | 例如设置为WP，那么默认生成的Class格式为WPXXXXX | **建议修改为自己的相关信息** |
| modelNameFooter | 默认model名字的后边部分 | 例如设置为Model，那么默认生成的Class格式为XXXXXModel | **建议修改为自己的相关信息** |
| allCLassInOneFile | 是否全部class在一个文件，部分语言不支持，例如Java |  | √ |
| showContainerGeneric | 是否显示容器(数组、集合等)的泛型类型。是否支持看语言而定，例如Swift必须写泛型 |  | √ |
| propertyKeywords | 声明属性的关键词 |  | √ |
| createdInfo | 创建信息 |  | **建议修改为自己的相关信息** |

## 注意事项

1.由于JavaScript里边小数点后面为0的数字全部判断为int，例如：填写JSON为{“width” : 17.0}，那么width字段会被判断为int的类型；

2.日期不做处理，因为不明确JSON里边字符什么格式为日期，也有可能是时间戳对应日期。

## 为其他语言创建配置

1.在language-config.js里边添加相应语言的配置JSON。langueName改为该语言的名称，各项配置也改为该语言的配置。

2.在creator文件夹里边创建该语言的creator.js，里边的内容模仿其他已写好的语言即可。

3.修改json-parse.js里边WPFileInfoMetaHandler里边的两个分发方法，修改WPCreateFileContentForAllClass里边的分发方法。

![修改json-parse.js里边的三个方法](https://github.com/dopawoo/JsonToFile/blob/master/readme-img/json-parse-modify.png)

4.修改index.html里边的langues

>     langues: ['Swift', 'ObjectiveC', 'Java' '你添加的语言']

**注意langues数组语言的顺序要跟language-config.js里边LanguesConfigArray数组顺序对应。**

![修改index.html](https://github.com/dopawoo/JsonToFile/blob/master/readme-img/index-html-modify.png)

