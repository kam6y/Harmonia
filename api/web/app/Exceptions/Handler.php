<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];
    public function report(Throwable $exception)
    {
        // 例外を常にログに出力する
        Log::error(
            sprintf(
                "[%s] %s in %s:%s\nStack trace:\n%s",
                now()->toDateTimeString(),
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine(),
                $exception->getTraceAsString()
            )
        );

        // 親クラスのレポートも実行（デフォルトのログレベル等を維持）
        parent::report($exception);
    }

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
}
