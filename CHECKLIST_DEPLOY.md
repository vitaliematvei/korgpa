# Checklist pentru push pe Git și setup pe Vercel

## Înainte de push pe Git

- [ ] Asigură-te că `.env.local` și alte fișiere sensibile sunt în `.gitignore`
- [ ] Rulează `npm run test` și confirmă că toate testele trec
- [x] Rulează `npm run build` și confirmă că build-ul trece fără erori
- [ ] Fă commit la toate fișierele relevante (fără `node_modules`, `.env.local`, foldere de build etc.)
- [ ] Inițializează repo-ul Git dacă nu există: `git init`
- [ ] Adaugă remote-ul: `git remote add origin <repo-url>`
- [ ] Fă push: `git add . && git commit -m "Initial commit" && git push -u origin main`

## Setup pe Vercel

- [ ] Creează un nou proiect pe Vercel și conectează-l la repo-ul Git
- [ ] Adaugă toate variabilele de mediu din `.env.local` în dashboard-ul Vercel (Settings > Environment Variables)
- [ ] Verifică build-ul și deployment-ul automat pe Vercel
- [ ] Testează funcționalitățile critice pe domeniul Vercel (checkout, email, download)
- [ ] Activează protecția pentru variabilele sensibile (nu le expune în client)

## Recomandări suplimentare

- [ ] Folosește branch-uri pentru dezvoltare și feature-uri noi
- [ ] Adaugă badge-uri de build/test în README
- [ ] Monitorizează erorile și logurile din dashboard-ul Vercel

Succes la lansare!
