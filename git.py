import subprocess
import sys
import os

def run_git_command(command, description):
    """Git 명령어를 실행하고 결과를 출력합니다."""
    print(f"\n🔄 {description} 실행 중...")
    try:
        # 현재 스크립트가 있는 디렉토리에서 명령어 실행
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Windows에서 한글 인코딩 문제 해결을 위한 설정
        startupinfo = None
        if os.name == 'nt':  # Windows
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startupinfo.wShowWindow = subprocess.SW_HIDE
        
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True, 
            cwd=script_dir,
            startupinfo=startupinfo,
            encoding='utf-8',
            errors='ignore'
        )
        print(f"✅ {description} 완료!")
        if result.stdout:
            print(f"출력: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} 실패!")
        if e.stderr:
            print(f"오류: {e.stderr.strip()}")
        return False

def main():
    print("🚀 Git 자동화 스크립트 시작!")
    print("=" * 50)
    
    # 스크립트가 있는 디렉토리로 작업 디렉토리 변경
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # 현재 디렉토리 확인
    current_dir = os.getcwd()
    print(f"현재 작업 디렉토리: {current_dir}")
    
    # Git 명령어들 실행
    commands = [
        ("git pull origin", "원격 저장소에서 최신 변경사항 가져오기"),
        ("git add .", "모든 변경사항 스테이징"),
        ("git commit -m \"인사팀업로드\"", "커밋 생성"),
        ("git push origin main", "원격 저장소에 푸시")
    ]
    
    success_count = 0
    
    for command, description in commands:
        if run_git_command(command, description):
            success_count += 1
        else:
            print(f"\n⚠️  {description}에서 오류가 발생했습니다. 스크립트를 중단합니다.")
            break
    
    print("\n" + "=" * 50)
    if success_count == len(commands):
        print("🎉 모든 Git 작업이 성공적으로 완료되었습니다!")
    else:
        print(f"⚠️  {success_count}/{len(commands)} 개의 작업이 완료되었습니다.")
    
    input("\n엔터 키를 누르면 종료됩니다...")

if __name__ == "__main__":
    main() 