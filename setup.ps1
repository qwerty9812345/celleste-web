param([switch]$Start)

Write-Host @"

  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃   🏠  Celleste Family Site Setup    ┃
  ┃   Сайт семьи с Discord-верификацией  ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

"@ -ForegroundColor Cyan

# Проверка Node.js
try {
  $nodeVer = node --version
  Write-Host "  ✅ Node.js $nodeVer" -ForegroundColor Green
} catch {
  Write-Host "  ❌ Node.js не найден!" -ForegroundColor Red
  Write-Host "  Скачайте и установите: https://nodejs.org (версия 18+)" -ForegroundColor Yellow
  Read-Host "  Нажмите Enter после установки"
  try {
    $nodeVer = node --version
    Write-Host "  ✅ Node.js $nodeVer" -ForegroundColor Green
  } catch {
    Write-Host "  ❌ Всё ещё не найден. Установите вручную." -ForegroundColor Red
    exit 1
  }
}

if (-not (Test-Path ".env")) {
  Write-Host "  ═══════════════════════════════════════════════════════" -ForegroundColor Yellow
  Write-Host "       СЕЙЧАС БУДЕТ 4 ВОПРОСА - НУЖНЫ ДАННЫЕ ИЗ DISCORD" -ForegroundColor Yellow
  Write-Host "  ═══════════════════════════════════════════════════════" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "  Откройте в браузере: https://discord.com/developers/applications" -ForegroundColor Cyan
  Write-Host "  Создайте New Application -> Celleste Family" -ForegroundColor Cyan
  Write-Host ""

  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host "  🔹 ВОПРОС 1 ИЗ 4: APPLICATION ID (Client ID)" -ForegroundColor Magenta
  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host ""
  Write-Host "  Где взять:"
  Write-Host "  1. Зайдите на https://discord.com/developers/applications" -ForegroundColor Cyan
  Write-Host "  2. Нажмите New Application" -ForegroundColor Cyan
  Write-Host "  3. Название -> Celleste Family -> Create" -ForegroundColor Cyan
  Write-Host "  4. На странице General Information найдите" -ForegroundColor Cyan
  Write-Host "     APPLICATION ID (длинное число)" -ForegroundColor Cyan
  Write-Host "  5. Нажмите Copy (кнопка справа)" -ForegroundColor Green
  Write-Host ""
  $clientId = Read-Host "  Вставьте APPLICATION ID"
  Write-Host ""

  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host "  🔹 ВОПРОС 2 ИЗ 4: Client Secret" -ForegroundColor Magenta
  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host ""
  Write-Host "  Где взять (на той же странице):" -ForegroundColor White
  Write-Host "  1. Чуть ниже APPLICATION ID найдите" -ForegroundColor Cyan
  Write-Host "     CLIENT SECRET" -ForegroundColor Cyan
  Write-Host "  2. Нажмите Reset Secret -> Yes, do it!" -ForegroundColor Cyan
  Write-Host "  3. Нажмите Copy (справа от появившейся строки)" -ForegroundColor Green
  Write-Host ""
  Write-Host "  ⚠️  ПОКАЗЫВАЕТСЯ ОДИН РАЗ! Сразу вставьте сюда." -ForegroundColor Yellow
  Write-Host ""
  $clientSecret = Read-Host "  Вставьте Client Secret"
  Write-Host ""

  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host "  🔹 ВОПРОС 3 ИЗ 4: Bot Token" -ForegroundColor Magenta
  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host ""
  Write-Host "  Где взять:" -ForegroundColor White
  Write-Host "  1. В левом меню нажмите Bot" -ForegroundColor Cyan
  Write-Host "  2. Нажмите Add Bot -> Yes, do it!" -ForegroundColor Cyan
  Write-Host "  3. В разделе Token нажмите Reset Token -> Yes" -ForegroundColor Cyan
  Write-Host "  4. Скопируйте токен (длинная строка)" -ForegroundColor Green
  Write-Host ""
  Write-Host "  ⚠️  НЕ ЗАБУДЬТЕ включить под токеном:" -ForegroundColor Yellow
  Write-Host "     ✅ SERVER MEMBERS INTENT" -ForegroundColor Yellow
  Write-Host "     ✅ MESSAGE CONTENT INTENT" -ForegroundColor Yellow
  Write-Host "     И нажать Save Changes" -ForegroundColor Yellow
  Write-Host ""
  $botToken = Read-Host "  Вставьте Bot Token"
  Write-Host ""

  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host "  🔹 ВОПРОС 4 ИЗ 4: ID сервера (Guild ID)" -ForegroundColor Magenta
  Write-Host "  ═══════════════════════════════════════════════" -ForegroundColor Magenta
  Write-Host ""
  Write-Host "  Где взять:" -ForegroundColor White
  Write-Host "  1. Откройте Discord" -ForegroundColor Cyan
  Write-Host "  2. Шестеренка ⚙️ внизу слева -> Расширенные" -ForegroundColor Cyan
  Write-Host "  3. Включите Режим разработчика" -ForegroundColor Cyan
  Write-Host "  4. Закройте настройки" -ForegroundColor Cyan
  Write-Host "  5. ПРАВОЙ КНОПКОЙ по вашему серверу" -ForegroundColor Cyan
  Write-Host "     в списке слева" -ForegroundColor Cyan
  Write-Host "  6. Выберите Копировать ID сервера" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Если нет сервера: нажмите ➕ внизу списка -> Create" -ForegroundColor Yellow
  Write-Host ""
  $guildId = Read-Host "  Вставьте ID сервера"

  $sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % { [char]$_ })
  $baseUrl = "http://localhost:3000"
  $invite = Read-Host "  Ссылка-приглашение на сервер (https://discord.gg/..., Enter = пропустить)"

  @"
# Discord Application (создано: https://discord.com/developers/applications)
DISCORD_CLIENT_ID=$clientId
DISCORD_CLIENT_SECRET=$clientSecret
DISCORD_BOT_TOKEN=$botToken

# ID Discord сервера семьи
GUILD_ID=$guildId

# Название роли для доступа к закрытой части
VERIFIED_ROLE=Celleste

# Секрет для сессий (сгенерирован автоматически)
SESSION_SECRET=$sessionSecret

# URL сайта
BASE_URL=$baseUrl

# Ссылка-приглашение на Discord сервер
DISCORD_INVITE=$invite
"@ | Set-Content ".env" -Encoding UTF8

  Write-Host ""
  Write-Host "  ✅ .env создан!" -ForegroundColor Green
}

# Установка зависимостей
Write-Host ""
Write-Host "  📦 Установка зависимостей..." -ForegroundColor Yellow
npm install --silent 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host "  ✅ Зависимости установлены" -ForegroundColor Green
} else {
  Write-Host "  ❌ Ошибка установки" -ForegroundColor Red
  exit 1
}

# Ярлык на рабочий стол
if (-not (Test-Path "start.bat")) {
  $choice = Read-Host "  Создать ярлык запуска на рабочем столе? (y/n)"
  if ($choice -eq 'y') {
    $desktop = [Environment]::GetFolderPath('Desktop')
    @"
@echo off
title Celleste Family Site
cd /d "C:\Users\aleks\Desktop\family-site"
echo.
echo   Starting Celleste Family Site...
echo.
npm start
pause
"@ | Set-Content "$desktop\Celleste Family.bat" -Encoding Default
    Write-Host "  ✅ Ярлык на рабочем столе: Celleste Family.bat" -ForegroundColor Green
  }
}

# Финальные шаги
$envContent = Get-Content ".env" | Where-Object { $_ -notmatch '^#' -and $_ -match '=' }
$clientId = ($envContent | Where-Object { $_ -match '^DISCORD_CLIENT_ID=' }) -replace '.*=',''
$baseUrl = ($envContent | Where-Object { $_ -match '^BASE_URL=' }) -replace '.*=',''

Write-Host @"

  ═══════════════════════════════════════════════════════
       🎉  НАСТРОЙКА ЗАВЕРШЕНА!
  ═══════════════════════════════════════════════════════

  Осталось сделать в браузере (1 минута):

  Шаг A — добавить Redirect:
    1. Откройте: https://discord.com/developers/applications/$clientId/oauth2
    2. В разделе Redirects нажмите Add Redirect
    3. Вставьте: $baseUrl/auth/discord/callback
    4. Нажмите Save

  Шаг B — пригласить бота на сервер:
    1. На той же странице найдите OAuth2 URL Generator
    2. Scopes: отметьте bot, identify, guilds, guilds.members.read
    3. Permissions: отметьте Send Messages, Manage Roles, Read Message History
    4. Откройте сгенерированную ссылку
    5. Выберите сервер -> Authorize

  Шаг C — создать роль Celleste:
    1. В Discord: ПКМ по серверу -> Server Settings -> Roles
    2. Create Role -> название Celleste -> Create
    3. Выдайте роль: Server Settings -> Members -> + -> Celleste

  Шаг D — запустить сайт:
    1. Дважды кликните start.bat (или "Celleste Family.bat" на рабочем столе)
    2. Или в PowerShell: npm start
    3. Откройте браузер -> http://localhost:3000
  
"@ -ForegroundColor Cyan

if (-not $Start) {
  Write-Host "  Нажмите Enter чтобы закрыть окно" -ForegroundColor DarkGray
  Read-Host | Out-Null
}
