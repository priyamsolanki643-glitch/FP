git add -A
git commit -m "fix: update test-ai model to gemini-2.5-flash to match runtime usage"
git push origin main
git push fp_repo main
git push fp_repo main:backend --force
