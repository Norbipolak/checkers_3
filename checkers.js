class Checkers {
    table;
    round;
    highlighted;
    points;
    blackPointsSpan;
    whitePointsSpan;

    constructor() {
        this.table = document.querySelector("#table");
        this.blackPointsSpan = document.querySelector("#black-points");
        this.whitePointsSpan = document.querySelector("#white-points");

        this.highlighted = {
            row: -1,
            col: -1,
            player: null,
            possibleSteps: []
        }

        this.points = {
            "black": 0,
            "white": 0
        }

        this.round = "black";
        this.generateField();
    }

    showResults() {
        this.blackPointsSpan.innerText = this.points.black;
        this.whitePointsSpan.innerText = this.points.white;

        /*itt írjuk ki, hogy ki lett a nyertes*/
        if (this.points.black === 8) {
            this.blackPointsSpan.innerText = "Nyertes!";
        } else if (this.points.white === 8) {
            this.whitePointsSpan.innerText = "Nyertes!";
        }

    }

    generateFields() {
        for (let i = 1; i <= 64; i++) {
            const row = Math.ceil(i / 8);
            const col = (i - 1) % 8 + 1;
            const field = document.createElement("div");
            field.classList.add("field");
            let player = null;

            this.step(field, row, col);

            if (row % 2 === 1 && col % 2 === 0) {
                field.classList.add("black-bg");
                player = document.createElement("div");
            } else if (row % 2 === 0 && col % 2 === 1) {
                field.classList.add("black-bg");
                player = document.createElement("div");
            }

            if (player && row < 3) {
                player.classList.add("player");
                player.classList.add("black-player");
                field.appendChild(player);
            } else if (player && row >= 7) {
                player.classList.add("player");
                player.classList.add("white-player");
                field.appendChild(player);
            }

            field.id = `field-${row}-${col}`;

            if (player) {
                player.setAttribute("row", row);
                player.setAttribute("col", col);
                this.highlightPlayer(player);
            }

            this.table.appendChild(field);
        }
    }

    highlightPlayer(player) {
        player.addEventListener("click", (e) => {
            e.stopPropagation();
            const row = parseInt(player.getAttribute("row"));
            const col = parseInt(player.getAttribute("col"));
            /*
            Csináltunk a highlighted-ba egy olyat, hogy possibleSteps, ami egy tömb lesz és majd aszerint, hogy van 4 lehetséges lépésünk 
            attől függően, hogy fekete vagy fehér a fields-be, meg fontos itt megnézni, hogy van-e azon a mezőn ellenséges bábú, mert ha igen 
            akkor oda nem tudunk lépni, viszont le tudjuk űtni, de akkor más a lépés 
            */
            for (const s of this.highlighted.possibleSteps)
                s.field.classList.remove("possible-step");
            /*levesszük a possible step kejelölést*/

            if (this.round === "white" && player.classList.contains("black-player")
                || this.round === "black" && player.classList.contains("white-player"))
                return;
            /*
            Ezzel akadályozzuk meg, hogy ki tudjunk jelölni más színt, pl.amikor a round az fekete és a 
            player.classList.contains("black-player") akkor return illetve fordítva is
            tehát itt fontos két dolog a round illetve a classList-je a player-nek, ebből tudjuk megállapítani 
            */

            /*
            ha már rajta volt a highlight, akkor leveszzük az biztos, highlighed.player lesz, mert a player-re tesszük rá 
            a highlight osztályt majd azt beletesszük egy highighted objektumba 
            */
            if (this.highlighted.player)
                this.highlighted.player.classList.remove("highlight");

            player.classList.add("highlight");
            //itt meg ha nem volt rajta a highlight class akkor rátesszük

            /*
            Csinálunk két tömböt az egyik tartalmazni fogja a field-eket ahova léphetünk, possibleSteps meg pontosan azokat ahova léphet 
            egy fekete vagy egy fehér
            */
            const possibleSteps = [];
            const fields = [];
            /*
            ezek jöhetnek szóba a row és a col-t figyelembe véve, fehér mindig felfele megy egy row-t, fekete mindig lefele megy egy row-t 
            az meg megegyezik mendketőnél, hogy balra és jobbra is tudnak menni egy col-t, tehát összesen 4 lehetőség lesz
            ezeket ki tudjuk olvasni ugye a player-nek a row és col attributumából és ugye attól képest!!!!! 
            */
            const field1 = document.querySelector(`#field-${row - 1}-${col - 1}`);
            const field2 = document.querySelector(`#field-${row - 1}-${col + 1}`);
            const field3 = document.querySelector(`#field-${row + 1}-${col - 1}`);
            const field4 = document.querySelector(`#field-${row + 1}-${col + 1}`);

            //players-nek csináltunk egy checkers attributumot, ami megmodja, hogy beért-e, mert akkor tud hátrafele menni is 
            const isCheckers = player.getAttribute("checkers") !== null;
            //ha az attributum nem = null-val, akkor az azt jelenti, hogy már beért és tud hátrafele menni is 

            /*
            itt megnézzük, hogy alapesetben ha black-player van, akkor hova tud menni, ezt belepushol-juk a a fields-be 
            és megnézük, hogy van-e ott ahova alapból akarunk lépne egy white-player, mert ha igen, akkor nem tudunk oda lépni
            majd leütjük, stb., de ez majd késöbb jön
            */

            /*
            ez ha normális esetben, merre tud lépni a black-player
            1. le kell ellenőrizni, hogy az a mező nem null-e, ez azért, mert nehogy kimenjünk a pályáról
            2. le kell ellőrizni, hogy ott nincsen-e egy white-player, tehát annak a mezőnek a nincsen children-je  
            */
            if (player.classList.contains("black-player")) {
                //itt megadjuk az alapeseteket és belepush-oljuk a fields tömbbe 
                fields.push(document.querySelector(`#field-${row - 1}-${col - 1}`));
                fields.push(document.querySelector(`#field-${row - 1}-${col + 1}`));

                /*
                itt ha checkers van azt majd a step-be fogjuk meghatározni, hogy mikor van checkers, akkor belerakjuk a possibleSteps-be 
                a field3-at, ami amugy rendes esetben ha nincs checkers, akkor a white-player egyik lépése, tehát a row az biztos, hogy +1
                */

                if (isCheckers && field3 !== null && field3.children.length === 0) {
                    possibleSteps.push({
                        field: field3,
                        hit: null
                    });
                }
                //ezt megcsináljuk a másikkal is, mert ugye két eset van a col miatt, két ilyen field van és eddig még csak a field3-at raktuk be

                if (isCheckers && field4 !== null && field4.children.length === 0) {
                    possibleSteps.push({
                        step: field4,
                        hit: null
                    })
                }
                /*
                tehát, ha checkers van beért a field4  az nem egyenlő null-val tehát létezik és a children.length az 0, tehát 
                nincs benne white-player, akkor oda tudunk lépni és betesszük a possibleSteps-be!! 
                */

                /*
                a field1-et meg a field2-t, ahova léphet simán, azt is beletesszük a possibleSteps-be
                */

                if (field1 !== null && field1.children.length === 0) {
                    possibleSteps.push({
                        field: field1,
                        hit: null
                    });
                }

                if (field2 !== null && field2.children.length === 0) {
                    possibleSteps.push({
                        field: field2,
                        hit: null
                    });
                }
                //fontos, hogy előbb azt ellenőrizzük, hogy létezik-e a field és csak utána, hogy van-e benne children!!!

            } else {
                //ez meg akkor ha nem black-player, tehát white-player 
                fields.push(document.querySelecotor(`#field-${row + 1}${col - 1}`));
                fields.push(document.querySelector(`#field-${row + 1}-${col - 1}`));

                //itt még nem csináltuk meg, hogyha van checkers, csak azokat raktuk be a possibleSteps-be amikre rendesen léphet
                /*
                if(isCheckers && field1 !== null && field1.children.length === 0) {
                    possibleSteps.push({
                        field:field1,
                        hit:null
                    });
                }
                if(isCheckers && field2 !== null && field2.children.length === 0) {
                    possibleSteps.push({
                        field: field2,
                        hit:null
                    });
                }
                */

                if (field3 !== null && field3.children.length === 0) {
                    possibleSteps.push({
                        field: field3,
                        hit: null
                    });
                }

                if (field4 !== null && field4.children.length === 0) {
                    possibleSteps.push({
                        field: field4,
                        hit: null
                    });
                }
            }

            /*
            végigmegyünk a field-eken és majd azt nézzük meg, hogy ott van-e ellenfél bábú, ha igen, akkor attól függően, hogy milyen 
            kör van black vagy white-player az fog majd tudni ütni és akkor a black nem row -1 hanem -2 lesz a col meg +1, -1 helyett 
            +2,-2 és majd a white-player-nél a col ugyanez, de viszont a row nem +1 hanem +2 
            */
            /*
            Ezért kellett a field-be pusholni, mert, hogy itt végigmegyünk rajtuk és megnézzük, hogy a children az nem nulla, arra csináljuk ezt 
            */
            for (const field of fields) {
                if (field === null)
                    continue;
                /*
                ha continue, akkor továbbmegy az iterációban de ahol a field === null volt azt kihagyja!!!!!!!!!!!!!!!!!!!!!!!!!
                ezért jó itt ez, nem a return, mert akkor ott az iteráció befejeződik teljesen ha talál egy olyat amire igaz ez, hogy 
                field === null
                */

                const children = field.children;
                //ezt azért, hoztuk ki egy változóba, mert sokat fogunk használni ezt és így kevesebbett írunk 

                /*
                pl. itt rögtön, hogy a children.length az nem nulla, tehát van egy olyan mezőben, ahova alapból léhetünk egy ellenfél 
                */
                if (children.length > 0) {
                    const child = children[0];
                    /*
                    Azért children[0], mert a .children az visszaad nekünk egy html collection-t és az egy objektum-hoz hasonló valami
                    és ha csak egy eleme van, mint jelen esetben, akkor is csak úgy tudunk rá vonatkoztatni, hogy children[0]
                    és ugye ennek van egy length-je is amire már több esetben is referáltunk -> pl. field1.children.length === 0;
                    vagy itt a kikőtésben, hogy children.length az > 0 
                    */
                    /*
                    itt meg meg tudjuk a children-nek a col-ját a getAttribute-val -> mert az valami hasonló
                    <div class="field" id="field-1-3">
                        <div class="player white-player" row="1" col="3"></div>
                    </div>
                    */
                    const childCol = parseInt(child.getAttribute("col")); // itt megszereztük ezt -> col="3"
                    /*
                    és most ezt a col-t tehát az ellenfélét, összehasonlítjuk a mienkkel és ha ez a col kisebb, mint a mienk 
                    akkor -2 lesz a lépés 
                    tehát childCol -> a col-ja annak ami a közelünkbe van field child-jának a col-ja 
                    col -> ami mi col-unk, ahol a mi bábunk áll -> const col = parseInt(player.getAttribute("col"));
                    és ha ez a childCol az kisebb, mint a mienk akkor ugye át kell ugranunk és még eggyel kisebb col-ú mezőre léphetünk 
                    ha meg nagyobb akkor alapból akkor oda léphetünk, ami nagybb +2 a mi jelenleginél 
                    ->  
                    */
                    const newCol = childCol < col ? col - 2 : col + 2;
                    /*
                    így tudjuk átugrani attól függően, hogy merre van tölünk, meg ugye a row-nál egyszerübb lesz, mert ott 
                    ha white-player akkor 2-t megyünk előre, tehát +2 (fieldWhite) ha meg black-player-vel vagyunk, akkor meg 
                    2-t kell hátra, szóval -2 (fieldBlack)
                    */
                    const fieldBlack = document.querySelector(`#field-${row - 2}-${newCol}`);
                    const fieldWhite = document.querySelector(`#field-${row + 2}-${newCol}`);
                    //és akkor így 2-vel kevesebb sort kellett írnunk, hogy a newCol-t azt meghatároztuk!!! 

                    /*
                    itt meg beletesszük ezt a mezőt a possibleSteps-be
                    1. meghatározzuk, hogy milyen player-ről van szó black vagy white
                    2. a mező létezik-e és nincs ott bábú, mert ha létezik de ott is van bábú, akkor nem tudjuk leütni és továbbugrani ha 
                    azon a mezőn is van egy ellenfél bábú
                    3. az is nagyon fontos, hogy ott egy ellenfél bábú van-e, mert ilyenkor azt érzékeli, hogy ott is van egy bábú ha mienk 
                    de meg kell határozni, hogy az egy ellenfél bábú, ezt meg a child.classList.contains("ellenfél-player")
                    */
                    if (player.classList.contains("black-player") && fieldBlack !== null && fieldBlack.children.length === 0
                        && child.classList.contains("white-player")) {
                        possibleSteps.push({
                            field: fieldBlack,
                            hit: child
                        })
                        /*
                        mégegyszer a feltételek 
                        1. player.classList.contains("black-player") -> mi ezzel vagyunk, ami egy fekete bábú, mert van egy black-player class-ja
                        2. fieldBlack !== 0 -> ide szeretnénk majd menni, ez létezzen ez a mező 
                        3. fieldBlack.children.length === 0 -> ne legyen benne semmi, hogy tudjunk odaugrani, ne legyen children-je!!! 
                        4. child.classList.contains("white-player") -> tehát a child onnan jön, hogy 
                            - kiválasztottuk azokat a field-eket, ahova tudunk lépni -> field1, field2, field3, field4
                            - ezeket push-oltuk egy üres tömbbe -> pl. fields.push(document.querySelector(`#field-${row - 1}-${col - 1}`));
                            - azon a tömbbön végigmentünk -> for (const field of fields)
                            - meghatároztuk, hogy mi a child egy változóba -> const children = field.children;
                            - megnéztük, hogy ennek a length-je nagyobb-e, mint 0, tehát van benne children.length > 0
                            - const child = children[0] és akkor a child ami pontosan benne van ez, amit le akarunk ütni -> 
                            <div class="player white-player" row="1" col="6"></div>
                            és ez lesz majd leütve, meg átugorva és beletesszük a possibleSteps-hit-jébe 
                            field meg a blackField -> const fieldBlack = document.querySelector(`#field-${row - 2}-${newCol}`);
                        possibleSteps.push({
                            field: fieldBlack,
                            hit: child
                        })
                        ugyazezt megcsináljuk fordítva ha a white-player-vel vagyunk 
                        */
                        
                    } else if (player.classList.contains("white-player") && fieldWhite !== null &&
                    fieldWhite.children.length === 0 && child.classList.contains("black-player")) {
                        possibleSteps.push({
                            field:fieldWhite,
                            hit: child
                        });
                    }
                }
            }

            /*
            a possibleSteps-ben van egy olyan, hogy field, ahova beraktuk a mezőket, ahova tudunk lépni, akkor is ha tudunk 
            ütni és nincs ott semmi ahova ugranánk(fieldBlack, fieldWhite) meg a simán is (field1,2,3,4), ugye itt bejön, hogy 
            isCheckers-e, mert akkor pl. a black-player simán tud lépni a field1,2-re de visszont amikor isCheckers true, akkor meg 
            a field3,4-re is de addig viszont nem, white-player-nél fordítva tud a field3,4-re de ha viszont isCheckers true, akkor 1,2-re is

            végigmegyünk egy for-val a possibleSteps-en és ott a field-eknek adunk egy possible-step-et, amit megcsináltunk css-ben 
            és akkor a border-je majd ilyen lesz -> border: 3px solid #87dd62; szóval lássuk, hogy amikor kijelüljük a bábunkat a player-t 
            akkor majd azzal, hova tudunk majd lépni!! 
            */
            for(const step of possibleSteps) {
                step.field.classList.add("possible-step");
            }

            /*
            megadjuk a highlight-nak ezeket a dolgokat, hogy row, col, player meg a possibleSteps-et is 
            és akkor már itt lesznek tárolva ezek 
            */
            this.highlighted = {
                row,
                col, 
                player,
                possibleSteps
            }
        });
    }

    //ezzel lépünk majd, vár egy row-t egy col-t meg egy field-et
    step(row, col, field) {
        //létrehoztunk egy canMove változót, ami alapból false lesz, de majd ha tudunk lépni, akkor true-ra változtatjuk 
        let canMove = false;

        /*
        végigmegyünk a possibleSteps-eken, amit most már a highlighted-ban tárolunk 
        ott csinálunk egy id-t -> #field-${row}-${col}
        és ezt fogjuk összehasonlítani a possibleSteps.field-nek az id-jával 
        mert ott egy field az így néz ki 
        <div class="field" id="field-4-2"></div>
        és ha ez megegyezik az itt csinált minden meghatározott id-val akkor léphetünk 
        */
        this.highlighted.possibleSteps((s)=> {
            const id = `field-${row}${col}`;

            /*
            ha az itt csinált id az megegyezik azzal az id-val, ami highlighted.possibleSteps.field.id-val, ami itt 
            mert ugye ezen végigmentünk az s.field.id lesz 
            ha ez a két field megegyezik akkor léphetünk és canMove az true lesz! 
            */
            if(s.field.id === id) {
                canMove = true;
                /*
                másrészről, ha van hit -> mert ott beletettük a child-ot a hit-be hit: child a possibleSteps-be amit meg beleraktunk 
                a highlightedba, a child meg ugye maga ez -> <div class="player white-player" row="3" col="4"></div>
                akkor eltüntetjük ezt a div-et a remove-val innen és még a pontok számát is növeljük 
                */
                if(s.hit) {
                    //tehát ha a hit az true, mert ha nincs hit, akkor az null!!!! és akkor ezt tudjuk így ellenőrizni, hogy van-e
                    this.points[this.round]++;
                    s.hit.remove();
                    /*
                    a point meg ez alapból this.points = {"black": 0, "white": 0}
                    és mindig annak kell növelni, amilyen körben vagyunk ugye -> az meg a this.round, mert az ha black körben vagyunk, akkor 
                    this.round = "black" ha meg fehérben, akkor meg this.round = white;
                    és akkor azt lehet így helyetesíteni, hogy this.points.black, ugyanaz, mint a this.points[this.round] ha black a kör
                    */
                }
            }

            //levesszük a possible-step osztályt
            s.field.classList.remove("possible-step");
        });

        /*
        kiürítjük a highlighted-ból a possibleSteps-es dolgokat, hogy hova léphetünk meg hogy van-e hit, mert azt már kiírtuk 
        */
       this.highlighted.possibleSteps = [];

       /*
       ha canMove az nem true, akkor meg kiírjuk, hogy oda nem léphetsz és a player-ről meg levesszük a highlighted class-t 
       */
        if(!canMove) {
            this.highlighted.player.classList.remove("highlight");
            alert("Oda nem léphetsz!");
            return;
        }

        /*
        Beállítjuk, hogy mikor van checkers, ha a round az black tehát a black-player-vel lépünk és a row === 1 
        mert a black-player-ek a 7-8 sorból indulnak és ha átérnek az 1 sorba, akkor beállítjuk a checkers-t true-ra 
        white-nál pedig fordítva 
        */
        if(this.round === "black" && row === 1 || this.round === "white" && row === 8) {
            this.highlighted.player.setAttribute("checkers", true);
        }

        //megfordítjuk a kört 
        this.round = this.round === "black" ? "white" : "black";

        /*
        hozzáadjuk a highlighted.player-t a field-hez, tehát itt tesszük rá a bábút a mezőre 
        megkapja az új row-t meg a col-t, mert ugye mostmár ez változott!!!! 
        levesszük róla a highlight jelölést, class-t
        */
        field.appendChild(this.highlighted.player)
        this.highlighted.player.classList.remove("highlight");
        this.highlighted.player.setAttribute("row", row);
        this.highlighted.player.setAttribute("col", col);

        //itt a legvégén pedig kiűrítjük a highlighted objektumot
        this.highlighted = {
            row: -1,
            col: -1,
            player: null,
            possibleSteps: []
        }

        //itt meg mgehívjuk a showResults-ot!!! 
        this.showResults();
    }

}

new Checkers();