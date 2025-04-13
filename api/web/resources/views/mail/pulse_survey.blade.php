<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>アンケートのご案内</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background-color: #f8f8f8;
            padding: 10px;
            text-align: center;
        }
        .content {
            margin: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 15px;
            background-color: #3490dc;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #777;
        }
    </style>
</head>
<body>
<div class="header">
    <h1>パルスサーベイのご案内</h1>
</div>
<div class="content">
    <p>
        いつもお世話になっております。<br>
        本日は、本社のサービスの一環であるエンゲージメントサーベイのご案内です。
    </p>
    <p>
        下記のボタンよりアンケートにご回答いただけますと幸いです。
    </p>
    <p style="text-align: center;">
        <a class="button" href="http://localhost:3000/quiz/{{$survey_type}}/{{$tenantID}}/{{$instanceID}}">アンケートに回答する</a>
    </p>
    {{--    ちょっと感覚きつい？--}}
    <p>
        受信後2~3日以内の回答をお願いいたします。
        今後ともよろしくお願いいたします。
    </p>
</div>
<div class="footer">
    <p>© {{ date('Y') }} Pomeranian Company. All Rights Reserved.</p>
</div>
</body>
</html>

