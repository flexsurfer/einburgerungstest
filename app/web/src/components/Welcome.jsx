import '../styles/Welcome.css'

export function Welcome({ onStart }) {

  return (

    <div className="welcome-container">

      <div className="welcome-content">

        <div className="readme-content">

          <p>Website: <a href="https://www.ebtest.org/" target="_blank" rel="noopener noreferrer">https://www.ebtest.org/</a></p>

          <p>This is a free, open-source and user-friendly test app for the <strong>&quot;Leben in Deutschland&quot;</strong> and <strong>Einbürgerungstest</strong> questions.</p>

          <p>It works offline after the first load and requires no servers.</p>

          <p>Created by a foreigner on a voluntary basis.</p>

          <p>If you like it — please give it a ⭐ star!</p>

          <p><a href="https://github.com/flexsurfer/einburgerungstest" target="_blank" rel="noopener noreferrer">https://github.com/flexsurfer/einburgerungstest</a></p>

          <p><strong>Disclaimer:</strong> The author takes no responsibility for any mistakes or inaccuracies.</p>

          <p>Pull requests and issues are welcome.</p>

          <p>Questions are based on the official dataset from:</p>

          <p><a href="https://www.bamf.de" target="_blank" rel="noopener noreferrer">www.bamf.de – Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“, Stand: 07.05.2025</a></p>

          <hr />

          <p>Dies ist ein kostenloser, quelloffener und benutzerfreundlicher Test zur Vorbereitung auf den <strong>&quot;Leben in Deutschland&quot;</strong>-Test und den <strong>Einbürgerungstest</strong>.</p>

          <p>Funktioniert offline nach dem ersten Laden und benötigt keine Server.</p>

          <p>Erstellt von einem Ausländer auf freiwilliger Basis.</p>

          <p>Wenn dir das Projekt gefällt — bitte gib einen ⭐ Stern!</p>

          <p><a href="https://github.com/flexsurfer/einburgerungstest" target="_blank" rel="noopener noreferrer">https://github.com/flexsurfer/einburgerungstest</a></p>

          <p><strong>Haftungsausschluss:</strong> Der Autor übernimmt keine Verantwortung für Fehler oder Ungenauigkeiten.</p>

          <p>Pull Requests und Issues sind willkommen.</p>

          <p>Fragen basieren auf dem offiziellen Katalog von:</p>

          <p><a href="https://www.bamf.de" target="_blank" rel="noopener noreferrer">www.bamf.de – Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“, Stand: 07.05.2025</a></p>

          <hr />

          <p>Bu, <strong>&quot;Leben in Deutschland&quot;</strong> ve <strong>Einbürgerungstest</strong> için hazırlanmış ücretsiz, açık kaynaklı ve kullanıcı dostu bir test uygulamasıdır.</p>

          <p>İlk yüklemeden sonra çevrimdışı çalışır ve sunucuya ihtiyaç duymaz.</p>

          <p>Bir yabancı tarafından gönüllü olarak geliştirilmiştir.</p>

          <p>Beğendiyseniz ⭐ yıldız vermeyi unutmayın!</p>

          <p><a href="https://github.com/flexsurfer/einburgerungstest" target="_blank" rel="noopener noreferrer">https://github.com/flexsurfer/einburgerungstest</a></p>

          <p><strong>Sorumluluk reddi:</strong> Yazar, hata veya yanlışlıklardan sorumlu değildir.</p>

          <p>Pull request’ler ve issue’lar memnuniyetle karşılanır.</p>

          <p>Sorular şu kaynağa dayanmaktadır:</p>

          <p><a href="https://www.bamf.de" target="_blank" rel="noopener noreferrer">www.bamf.de – Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“, 07.05.2025 tarihli</a></p>

          <hr />

          <p>هذا اختبار مجاني ومفتوح المصدر وسهل الاستخدام لأسئلة <strong>&quot;العيش في ألمانيا&quot;</strong> و<strong>اختبار التجنيس</strong>.</p>

          <p>يعمل بدون إنترنت بعد التحميل الأول ولا يحتاج إلى خوادم.</p>

          <p>تم تطويره من قبل أجنبي بشكل تطوعي.</p>

          <p>إذا أعجبك المشروع — ضع نجمة ⭐ من فضلك.</p>

          <p><a href="https://github.com/flexsurfer/einburgerungstest" target="_blank" rel="noopener noreferrer">https://github.com/flexsurfer/einburgerungstest</a></p>

          <p><strong>تنبيه:</strong> المؤلف لا يتحمل أي مسؤولية عن الأخطاء أو عدم الدقة.</p>

          <p>طلبات السحب (PR) والمشكلات (issues) مرحب بها.</p>

          <p>الأسئلة مأخوذة من المصدر الرسمي:</p>

          <p><a href="https://www.bamf.de" target="_blank" rel="noopener noreferrer">www.bamf.de – Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“, بتاريخ 07.05.2025</a></p>

          <hr />

          <p>Это бесплатный, открытый и удобный тест по вопросам из <strong>«Leben in Deutschland»</strong> и <strong>теста на натурализацию (Einbürgerungstest)</strong>.</p>

          <p>Работает оффлайн после первой загрузки, не требует серверов.</p>

          <p>Сделан иностранцем на волонтёрской основе.</p>

          <p>Если нравится — поставьте ⭐ звёздочку!</p>

          <p><a href="https://github.com/flexsurfer/einburgerungstest" target="_blank" rel="noopener noreferrer">https://github.com/flexsurfer/einburgerungstest</a></p>

          <p><strong>Отказ от ответственности:</strong> Автор не несёт никакой ответственности за ошибки или неточности.</p>

          <p>Pull request’ы и issue приветствуются.</p>

          <p>Вопросы взяты из официального источника:</p>

          <p><a href="https://www.bamf.de" target="_blank" rel="noopener noreferrer">www.bamf.de – Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“, актуально на 07.05.2025</a></p>

        </div>

        <button className="start-button" onClick={onStart}>

          Los geht's

        </button>

      </div>

    </div>

  )

} 