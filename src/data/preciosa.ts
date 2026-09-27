/* Згенеровано scripts/build-catalog.mjs з data/preciosa-10-0.txt. Не редагувати вручну. */

/** Групи кольорів у каталозі (індекс — номер групи в рядку даних). */
export const FAMILIES: readonly string[] = ["Білі","Сірі","Чорні","Жовті","Помаранчеві","Червоні","Бордові","Рожеві","Фіолетові","Сині","Блакитні","Бірюзові","Зелені","Коричневі й бежеві"];

/** Рядок на колір: код|отвір (r/s)|HEX|група|назва українською|опис Preciosa англійською. Від світлих до темних. */
export const DATA = `38102|s|E4E3E3|0|Кришталь, біла серединка, сфінкс|crystal, colour lined chalkwhite, sfinx
38249|s|E5E1DD|0|Кришталь, сіра перламутрова серединка|crystal, colour lined grey pearl
58502|s|E1E1E2|0|Кришталь, біла серединка, райдужний|crystal, colour lined chalkwhite, rainbow
78102|s|E4E0DB|0|Кришталь, срібна серединка|crystal, silver lined
57206|s|E3DEC6|0|Білий алебастр, райдужний, глянець|alabaster white, rainbow, lustered
38292|s|E0DCD5|0|Кришталь, помаранчева перламутрова серединка|crystal, colour lined orange pearl
38002|s|DFDBD7|0|Кришталь, біла серединка|crystal, colour lined chalkwhite
38236|s|D7D8D9|0|Кришталь, синя перламутрова серединка|crystal, colour lined blue pearl
46381|s|D6D3CA|0|Крейдяно-білий, фарбований білим перламутром, глянець|chalkwhite pearl dyed chalkwhite, lustered
57205|s|D1D1D6|0|Білий алебастр, райдужний|alabaster white, rainbow
03050|r|D3CDC2|0|Крейдяно-білий|chalkwhite
16541|s|CCCDD4|0|Крейдяно-білий, фарбований сірим металіком, сфінкс|grey metallic dyed chalkwhite, sfinx
46102|s|D0CDC8|0|Крейдяно-білий, сфінкс|chalkwhite, sfinx
46205|s|D2CCBF|0|Крейдяно-білий, райдужний|chalkwhite, rainbow
07012|s|D2CBC7|0|Кришталь, фарбований рожевим|pink dyed crystal
382PD|s|CCC8C5|0|Кришталь, сіра перламутрова серединка, сфінкс|crystal, colour lined grey pearl, sfinx
68108|s|CDC8BE|0|Кришталь, алюмінієва серединка|crystal, aluminium lined
38602|s|C9C7C2|0|Кришталь, біла серединка, сфінкс|crystal, colour lined chalkwhite, sfinx
18302|s|CAC7BE|0|Срібний металік|silver metallic
78109|s|CFC5BF|0|Кришталь, срібна серединка, райдужний|crystal, silver lined, rainbow
38228|s|C7C4C4|0|Кришталь, фіолетова перламутрова серединка|crystal, colour lined violet pearl
48102|s|C1BCB4|0|Кришталь, сфінкс|crystal, sfinx
00050|r|B7AEA3|0|Кришталь|crystal
57102|s|B1AEA9|0|Білий алебастр, сфінкс|alabaster white, sfinx
02090|r|B5ADA2|0|Білий алебастр|alabaster white
58205|s|9E9381|0|Кришталь, райдужний|crystal, rainbow
38428|s|C3BFC1|1|Кришталь, фіолетова серединка|crystal, colour lined violet
382PB|s|B4BDC1|1|Кришталь, синя перламутрова серединка, сфінкс|crystal, colour lined blue pearl, sfinx
03441|s|C2B6AB|1|Кришталь, фарбований сірим|grey dyed crystal
03141|s|BBB5B3|1|Крейдяно-білий, фарбований сірим 2|grey 2 dyed chalkwhite
17708|s|AFB3BD|1|Алебастр, фарбований срібним металіком|silver metallic dyed alabaster
58135|s|B5B2B3|1|Кришталь, синій ірис|crystal, blue iris
61141|s|B6B1B2|1|Кришталь, фарбований сірим 2, сфінкс|grey 2 dyed crystal, sfinx
38449|s|B4B2AD|1|Кришталь, чорна серединка|crystal, colour lined black
03241|s|B1B1B1|1|Крейдяно-білий, фарбований сірим 1|grey 1 dyed chalkwhite
18908|s|B0ADA9|1|Кришталь, фарбований срібним металіком|silver metallic dyed crystal
16742|s|A5AAB9|1|Крейдяно-білий, фарбований сірим металіком|grey metallic dyed chalkwhite
18303|s|ACA999|1|Срібний металік|silver metallic
16949|s|A9A6A0|1|Крейдяно-білий, фарбований сірим перламутром терра|grey terra pearl dyed chalkwhite
08349|s|AAA5A1|1|Кришталь, фарбований сірим перламутром терра|grey terra pearl dyed crystal
37342|s|A0A6B2|1|Цейлон сірий|ceylon grey
69000|s|A2A7A2|1|Світлий аквамарин, мідна серединка|lt. aquamarine, copper lined
02241|s|A9A39D|1|Алебастр, фарбований сірим 1|grey 1 dyed alabaster
01241|s|A49A96|1|Кришталь, фарбований сірим 1|grey 1 dyed crystal
78241|s|A39893|1|Кришталь, фарбований сірим 1, срібна серединка|grey 1 dyed crystal, silver lined
17549|s|9A9997|1|Алебастр, фарбований чорним металіком, сфінкс|black metallic dyed alabaster, sfinx
47019|s|969692|1|Прозорий сірий, срібна серединка, райдужний|transp. grey, silver lined, rainbow
43141|s|99938E|1|Крейдяно-білий, фарбований сірим, райдужний|grey dyed chalkwhite, rainbow
28998|s|969391|1|Чорний, фарбований червоним перламутром|red pearl dyed black
28936|s|919395|1|Чорний, фарбований синім перламутром|blue pearl dyed black
18131|s|979191|1|Синій металік, сольгель|blue solgel metallic
01700|s|92908E|1|М'яке срібло|soft silver
38011|s|908F88|1|Кришталь, коричнева серединка|crystal, colour lined brown
48035|s|868F92|1|Кришталь, синій глянець|crystal, blue lustered
38642|s|8B8785|1|Кришталь, сіра серединка, сфінкс|crystal, colour lined grey, sfinx
18942|s|868584|1|Кришталь, фарбований сірим металіком|grey metallic dyed crystal
68301|s|888075|1|Срібло|silver
38044|s|818087|1|Кришталь, сіра серединка|crystal, colour lined grey
28958|s|798180|1|Чорний, фарбований зеленим перламутром|green pearl dyed black
41141|s|897C72|1|Кришталь, фарбований сірим, райдужний|grey dyed crystal, rainbow
43020|r|817B70|1|Непрозорий сірий|opaque grey
46035|s|747D7F|1|Крейдяно-білий, синій глянець|chalkwhite, blue lustered
38149|s|797982|1|Кришталь, чорна серединка, сфінкс|crystal, colour lined black, sfinx
27080|s|7D7474|1|Темний аметист, срібна серединка|dark amethyst, silver lined
44020|s|7C7263|1|Непрозорий сірий, райдужний|opaque grey, rainbow
38342|s|696D78|1|Кришталь, сіра серединка|crystal, colour lined grey
45016|s|6D6D6D|1|Прозорий сірий, біла серединка|transp. grey, colour lined chalkwhite
46010|s|6A6E6B|1|Прозорий сірий, сфінкс|transp. grey, sfinx
59155|s|676E6D|1|Зелений ірис|green iris
57549|s|6A6B6F|1|Білий алебастр, сіра серединка, райдужний|alabaster white, colour lined grey, rainbow
62141|s|6D6A66|1|Алебастр, фарбований сірим 2, сфінкс|grey 2 dyed alabaster, sfinx
38649|s|6A696B|1|Кришталь, чорна серединка, сфінкс|crystal, colour lined black, sfinx
48049|s|6D685F|1|Кришталь, чорний глянець|crystal, black lustered
68807|s|6D6154|1|Кришталь, фарбований під сталь|steel dyed crystal
18949|s|6A6158|1|Кришталь, фарбований чорним металіком|black metallic dyed crystal
78141|s|66605B|1|Кришталь, фарбований сірим 2, срібна серединка|grey 2 dyed crystal, silver lined
59195|s|64605F|1|Червоний ірис|red iris
03641|s|605F5F|1|Крейдяно-білий, фарбований сірим 3|grey 3 dyed chalkwhite
02641|s|625E5B|1|Алебастр, фарбований сірим 3|grey 3 dyed alabaster
38039|s|5C5F61|1|Кришталь, синя серединка|crystal, colour lined blue
29980|s|5E5E54|1|Травертин на чорному|travertine on black
48020|s|5C595C|1|Непрозорий сірий, сфінкс|opaque grey, sfinx
02141|s|5D5956|1|Алебастр, фарбований сірим 2|grey 2 dyed alabaster
49102|s|565858|1|Гематит|hematite
01141|s|5B534D|1|Кришталь, фарбований сірим 2|grey 2 dyed crystal
45018|s|4F4F4D|1|Прозорий сірий, біла серединка, райдужний|transp. grey, colour lined chalkwhite, rainbow
22022|s|554C45|1|Сірий PermaLux|PermaLux dyed chalk, grey
01670|s|4C4A48|1|М'яка бронза, мульти|soft bronze multi
41010|s|4A4948|1|Прозорий сірий, райдужний|transp. grey, rainbow
78641|s|4A473D|1|Кришталь, фарбований сірим 3, срібна серединка|grey 3 dyed crystal, silver lined
19155|s|464643|1|Темний топаз, бронзово-зелений ірис|dark topaz, bronze green iris
39940|s|43433E|1|Травертин на непрозорому синьому|travertine on opaque blue
57159|s|373D3E|1|Прозорий темно-зелений, срібна серединка, райдужний|transp. dark green, silver lined, rainbow
22m22|s|3B3B3B|1|Сірий PermaLux, матовий|PermaLux dyed chalk, grey, matt
38349|s|393A3B|1|Кришталь, чорна серединка|crystal, colour lined black
40010|r|3A3A38|1|Прозорий сірий|transp. grey
49055|s|35372A|2|Чорний, рожевий глянець|black, rose lustered
59205|s|393431|2|Чорний, райдужний|black, rainbow
30110|r|302F34|2|Темний сапфір|dark sapphire
49095|s|3D2B2A|2|Чорний, бузковий глянець|black, lila lustered
54270|s|2C2F34|2|Непрозорий темно-зелений, райдужний|opaque dark green, rainbow
01641|s|322C28|2|Кришталь, фарбований сірим 3|grey 3 dyed crystal
23300|r|252423|2|Білі смужки на чорному|white stripes on black
23980|r|232320|2|Чорний|black
16A86|s|FAE336|3|Крейдяно-білий, насичено фарбований жовтим|yellow intensive dyed chalkwhite
87010|s|F6E140|3|Прозорий бурштиново-жовтий, срібна серединка|transp. yellow amber, silver lined
16186|s|F3E13D|3|Крейдяно-білий, фарбований жовтим, сфінкс|yellow dyed chalkwhite, sfinx
382PI|s|E6DDC6|3|Кришталь, молочна перламутрова серединка, сфінкс|crystal, colour lined ivory pearl, sfinx
03481|s|F1DC9C|3|Кришталь, фарбований жовтим|yellow dyed crystal
38681|s|EEDD8C|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
38186|s|F4DC57|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
38386|s|E9DA9B|3|Кришталь, жовта серединка|crystal, colour lined yellow
88130|s|FBD81D|3|Непрозорий жовтий «лимон», сфінкс|opaque yellow "limon", sfinx
38182|s|F7D85E|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
38686|s|F0DA48|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
16386|s|F6D622|3|Крейдяно-білий, фарбований жовтим, сфінкс|yellow dyed chalkwhite, sfinx
03181|s|EBD68D|3|Крейдяно-білий, фарбований жовтим 2|yellow 2 dyed chalkwhite
38381|s|D8D7BF|3|Кришталь, жовта серединка|crystal, colour lined yellow
38286|s|DCD7A4|3|Кришталь, жовта перламутрова серединка|crystal, colour lined yellow pearl
83110|r|EFD60A|3|Непрозорий жовтий «лимон»|opaque yellow "limon"
48013|s|EBD386|3|Кришталь, жовтий глянець|crystal, yellow lustered
02181|s|F4D169|3|Алебастр, фарбований жовтим 2|yellow 2 dyed alabaster
83130|r|F9D106|3|Непрозорий жовтий «лимон»|opaque yellow "limon"
38184|s|DFD578|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
38181|s|E3D380|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
02253|s|D7D68C|3|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
02281|s|E5D184|3|Алебастр, фарбований жовтим 1|yellow 1 dyed alabaster
22001|s|F2CE5F|3|Світло-жовтий PermaLux|PermaLux dyed chalk, lt. yellow
16383|s|F5CE25|3|Крейдяно-білий, фарбований жовтим, сфінкс|yellow dyed chalkwhite, sfinx
81010|s|F1CF1F|3|Прозорий бурштиново-жовтий, райдужний|transp. yellow amber, rainbow
38481|s|E2D182|3|Кришталь, жовта серединка|crystal, colour lined yellow
38986|s|DED27D|3|Кришталь, жовта перламутрова серединка|crystal, colour lined yellow pearl
22m01|s|EBCF56|3|Світло-жовтий PermaLux, матовий|PermaLux dyed chalk, lt. yellow, matt
23830|s|D9D52C|3|Жовтий перламутр|
47113|s|E1CE98|3|Мушля|shell
58586|s|EACE49|3|Кришталь, жовта серединка, райдужний|crystal, colour lined yellow, rainbow
03281|s|DACE9C|3|Крейдяно-білий, фарбований жовтим 1|yellow 1 dyed chalkwhite
17886|s|F4C92A|3|Алебастр, фарбований жовтим|yellow dyed alabaster
88110|s|ECCC18|3|Непрозорий жовтий «лимон», сфінкс|opaque yellow "limon", sfinx
37186|s|E4CC76|3|Цейлон жовтий|ceylon yellow
01281|s|EDC93B|3|Кришталь, фарбований жовтим 1|yellow 1 dyed crystal
84110|s|E7CB23|3|Непрозорий жовтий «лимон», райдужний|opaque yellow "limon", rainbow
02251|s|E2C989|3|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
17286|s|CFCCAF|3|Алебастр, фарбований жовтим перламутром терра|yellow terra pearl dyed alabaster
85016|s|F2C60F|3|Прозорий бурштиново-жовтий, біла серединка|transp. yellow amber, colour lined chalkwhite
03251|s|D1CC96|3|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
68286|s|DBCB70|3|Кришталь, жовта металізована серединка|crystal, metallic colour lined yellow
17986|s|DFC64B|3|Алебастр, фарбований жовтим перламутром терра|yellow terra pearl dyed alabaster
38886|s|DDC73E|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
63181|s|E2C45F|3|Крейдяно-білий, фарбований жовтим 2, сфінкс|yellow 2 dyed chalkwhite, sfinx
38185|s|DBC661|3|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
78281|s|DBC483|3|Кришталь, фарбований жовтим 1, срібна серединка|yellow 1 dyed crystal, silver lined
17186|s|DFC516|3|Алебастр, фарбований жовтим, глянець|yellow dyed alabaster, lustered
03151|s|D3C493|3|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
01253|s|CDC951|3|Кришталь, фарбований зеленим 1|green 1 dyed crystal
87060|s|F0BD35|3|Гіацинт, срібна серединка|hyacinth, silver lined
08A86|s|E9BF05|3|Кришталь, насичена жовта серединка|crystal, intensive yellow lined
17386|s|E3C110|3|Цейлон жовтий|ceylon yellow
01181|s|EBBC3A|3|Кришталь, фарбований жовтим 2|yellow 2 dyed crystal
58582|s|CBC393|3|Кришталь, жовта серединка, райдужний|crystal, colour lined yellow, rainbow
02252|s|C5BF93|3|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
02151|s|CCBF6E|3|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
01251|s|D8BA56|3|Кришталь, фарбований зеленим 1|green 1 dyed crystal
17383|s|E9B42E|3|Цейлон жовтий|ceylon yellow
41181|s|ECB121|3|Кришталь, фарбований жовтим, райдужний|yellow dyed crystal, rainbow
03681|s|D7B853|3|Крейдяно-білий, фарбований жовтим 3|yellow 3 dyed chalkwhite
78253|s|C5BC7C|3|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
18286|s|D7B81C|3|Кришталь, фарбований жовтим, срібна серединка|yellow dyed crystal, silver lined
16786|s|C1B774|3|Крейдяно-білий, фарбований жовтим металіком|yellow metallic dyed chalkwhite
01252|s|BFB673|3|Кришталь, фарбований зеленим 1|green 1 dyed crystal
80010|r|DCAD0A|3|Прозорий бурштиново-жовтий|transp. yellow amber
83111|s|DDAC23|3|Непрозорий жовтий «лимон», жовто-коричневий глянець|opaque yellow "limon", yellow-brown luster
87019|s|D0B11D|3|Прозорий бурштиново-жовтий, срібна серединка, райдужний|transp. yellow amber, silver lined, rainbow
18383|s|C6B149|3|Золотий металік|gold metallic
61181|s|DEA725|3|Кришталь, фарбований жовтим 2, сфінкс|yellow 2 dyed crystal, sfinx
08283|s|C8AE50|3|Кришталь, фарбований жовтим, срібна серединка|yellow dyed crystal, silver lined
18386|s|C9AD5A|3|Золотий металік|gold metallic
16586|s|BCB06F|3|Крейдяно-білий, фарбований жовтим металіком, сфінкс|yellow metallic dyed chalkwhite, sfinx
08286|s|C9AD40|3|Кришталь, фарбований жовтим, срібна серединка|yellow dyed crystal, silver lined
02052|s|C5AD5E|3|Кришталь, фарбований зеленим|green dyed crystal
86010|s|CEA725|3|Прозорий бурштиново-жовтий, сфінкс|transp. yellow amber, sfinx
18586|s|C6A93E|3|Кришталь, фарбований золотим металіком|gold metallic dyed crystal
18161|s|A8AB7C|3|Зелений металік, сольгель|green solgel metallic
18181|s|BAA264|3|Золотий металік, сольгель|gold solgel metallic
17786|s|B1A55A|3|Алебастр, фарбований жовтим металіком|yellow metallic dyed alabaster
18154|s|AEA36D|3|Зелений металік, сольгель|green solgel metallic
78181|s|BA9D54|3|Кришталь, фарбований жовтим 2, срібна серединка|yellow 2 dyed crystal, silver lined
78681|s|C4992A|3|Кришталь, фарбований жовтим 3, срібна серединка|yellow 3 dyed crystal, silver lined
62181|s|C19429|3|Алебастр, фарбований жовтим 2, сфінкс|yellow 2 dyed alabaster, sfinx
02653|s|A69B39|3|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
03653|s|999E4A|3|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
78653|s|9A9A39|3|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
01151|s|A7962A|3|Кришталь, фарбований зеленим 2|green 2 dyed crystal
03651|s|A19656|3|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
78153|s|9F934C|3|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
01152|s|98903E|3|Кришталь, фарбований зеленим 2|green 2 dyed crystal
02152|s|978F46|3|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
78152|s|918960|3|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
53430|r|888E15|3|Непрозорий зелений|opaque green
01653|s|848A0F|3|Кришталь, фарбований зеленим 3|green 3 dyed crystal
38657|s|7B7D52|3|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
01651|s|937413|3|Кришталь, фарбований зеленим 3|green 3 dyed crystal
83730|r|656355|3|Арлекін жовто-синій|harlequin yellow-blue
38387|s|E3DAD4|4|Кришталь, помаранчева серединка|crystal, colour lined orange
06013|s|EAD7B1|4|Крейдяно-білий, фарбований бежевим|beige dyed chalkwhite
03011|s|F7D0AD|4|Кришталь, фарбований бежевим|beige dyed crystal
03182|s|F9CE9A|4|Крейдяно-білий, фарбований жовтим 2|yellow 2 dyed chalkwhite
38683|s|F7CD72|4|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
78282|s|EFCD9A|4|Кришталь, фарбований жовтим 1, срібна серединка|yellow 1 dyed crystal, silver lined
03211|s|EEC6B2|4|Крейдяно-білий, фарбований коричневим 1|brown 1 dyed chalkwhite
03282|s|E2C8A8|4|Крейдяно-білий, фарбований жовтим 1|yellow 1 dyed chalkwhite
02282|s|F9C184|4|Алебастр, фарбований жовтим 1|yellow 1 dyed alabaster
38992|s|E8C3A8|4|Кришталь, помаранчева перламутрова серединка|crystal, colour lined orange pearl
02283|s|FBBD8F|4|Алебастр, фарбований помаранчевим 1|orange 1 dyed alabaster
68483|s|E0C5AF|4|Кришталь, помаранчева металізована серединка, райдужний|crystal, metallic colour lined orange, rainbow
382PY|s|E7C67D|4|Кришталь, жовта перламутрова серединка, сфінкс|crystal, colour lined yellow pearl, sfinx
06012|s|E7C490|4|Крейдяно-білий, фарбований бежевим|beige dyed chalkwhite
78283|s|F2C089|4|Кришталь, фарбований помаранчевим 1, срібна серединка|orange 1 dyed crystal, silver lined
03283|s|EBC19B|4|Крейдяно-білий, фарбований помаранчевим 1|orange 1 dyed chalkwhite
17070|s|EAC46C|4|Топаз, срібна серединка|topaz, silver lined
03111|s|E3C1B5|4|Крейдяно-білий, фарбований коричневим 2|brown 2 dyed chalkwhite
382PA|s|F5BE80|4|Кришталь, абрикосова перламутрова серединка, сфінкс|crystal, colour lined apricot pearl, sfinx
37189|s|F8BAA2|4|Цейлон помаранчевий|ceylon orange
382PS|s|E3C1AC|4|Кришталь, лососева перламутрова серединка, сфінкс|crystal, colour lined salmon pearl, sfinx
07332|s|F1BCA3|4|Рожева терра|Rose terra
02681|s|F4BE47|4|Алебастр, фарбований жовтим 3|yellow 3 dyed alabaster
42181|s|DEC387|4|Білий алебастр, фарбований жовтим, райдужний|yellow dyed alabaster white, rainbow
03284|s|EEBB9F|4|Крейдяно-білий, фарбований помаранчевим 1|orange 1 dyed chalkwhite
48015|s|E5C084|4|Кришталь, жовто-коричневий глянець|crystal, yellow-brown lustered
03184|s|FAB591|4|Крейдяно-білий, фарбований помаранчевим 2|orange 2 dyed chalkwhite
03183|s|F9B67C|4|Крейдяно-білий, фарбований помаранчевим 2|orange 2 dyed chalkwhite
02211|s|EABA9B|4|Алебастр, фарбований коричневим 1|brown 1 dyed alabaster
78284|s|F1B793|4|Кришталь, фарбований помаранчевим 1, срібна серединка|orange 1 dyed crystal, silver lined
16020|s|EDBB6E|4|Світлий топаз, сфінкс|lt. topaz, sfinx
01282|s|F1B96C|4|Кришталь, фарбований жовтим 1|yellow 1 dyed crystal
86060|s|F7B531|4|Гіацинт, сфінкс|hyacinth, sfinx
37386|s|DEBC76|4|Цейлон жовтий|ceylon yellow
02285|s|FBAC91|4|Алебастр, фарбований помаранчевим 1|orange 1 dyed alabaster
38687|s|EAB297|4|Кришталь, помаранчева серединка, сфінкс|crystal, colour lined orange, sfinx
47185|s|DEB868|4|Мушля|shell
97000|s|F6AF4D|4|Гіацинт, срібна серединка|hyacinth, silver lined
17784|s|DDB681|4|Алебастр, фарбований помаранчевим металіком|orange metallic dyed alabaster
11020|s|EDB157|4|Світлий топаз, райдужний|lt. topaz, rainbow
01283|s|F8AC53|4|Кришталь, фарбований помаранчевим 1|orange 1 dyed crystal
15026|s|F1AF4A|4|Світлий топаз, біла серединка|lt. topaz, colour lined chalkwhite
17059|s|E5B258|4|Топаз, срібна серединка, райдужний|topaz, silver lined, rainbow
78251|s|D1B77C|4|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
38383|s|E8B132|4|Кришталь, жовта серединка|crystal, colour lined yellow
03185|s|F0A895|4|Крейдяно-білий, фарбований помаранчевим 2|orange 2 dyed chalkwhite
02284|s|F9A488|4|Алебастр, фарбований помаранчевим 1|orange 1 dyed alabaster
16183|s|EBAD57|4|Крейдяно-білий, фарбований жовтим, сфінкс|yellow dyed chalkwhite, sfinx
85067|s|F5A841|4|Гіацинт, біла серединка, сфінкс|hyacinth, colour lined chalkwhite, sfinx
68284|s|E7AD5E|4|Кришталь, жовта металізована серединка|crystal, metallic colour lined yellow
58583|s|E2B041|4|Кришталь, жовта серединка, райдужний|crystal, colour lined yellow, rainbow
22002|s|F3A820|4|Темно-жовтий PermaLux|PermaLux dyed chalk, dark yellow
22m02|s|F7A513|4|Темно-жовтий PermaLux, матовий|PermaLux dyed chalk, dark yellow, matt
38188|s|FB9F72|4|Кришталь, помаранчева серединка, сфінкс|crystal, colour lined orange, sfinx
87069|s|EEA837|4|Гіацинт, срібна серединка, райдужний|hyacinth, silver lined, rainbow
38918|s|D7AD91|4|Кришталь, коричнева перламутрова серединка|crystal, colour lined brown pearl
98110|s|FDA033|4|Непрозорий помаранчевий, сфінкс|opaque orange, sfinx
46085|s|D4AF7B|4|Крейдяно-білий, жовто-коричневий глянець|chalkwhite, yellow-brown lustered
16992|s|E3A87E|4|Крейдяно-білий, фарбований помаранчевим перламутром терра|orange terra pearl dyed chalkwhite
84130|s|EDA708|4|Непрозорий жовтий «лимон», райдужний|opaque yellow "limon", rainbow
78285|s|E0A791|4|Кришталь, фарбований помаранчевим 1, срібна серединка|orange 1 dyed crystal, silver lined
01284|s|FB9C57|4|Кришталь, фарбований помаранчевим 1|orange 1 dyed crystal
37188|s|E0A68A|4|Цейлон помаранчевий|ceylon orange
16389|s|F59F50|4|Крейдяно-білий, фарбований помаранчевим, сфінкс|orange dyed chalkwhite, sfinx
10022|s|EAA188|4|Світлий топаз, фіолетова серединка|lt. topaz, colour lined violet
26850|s|F79D61|4|Помаранчевий перламутр|
22m05|s|EAA181|4|Абрикосовий PermaLux, матовий|PermaLux dyed chalk, apricot, matt
47112|s|D6AA6A|4|Мушля|shell
03682|s|DFA660|4|Крейдяно-білий, фарбований жовтим 3|yellow 3 dyed chalkwhite
93110|r|F29F08|4|Непрозорий помаранчевий|opaque orange
38187|s|E1A286|4|Кришталь, помаранчева серединка, сфінкс|crystal, colour lined orange, sfinx
37389|s|D4A697|4|Цейлон помаранчевий|ceylon orange
78211|s|D0A886|4|Кришталь, фарбований коричневим 1, срібна серединка|brown 1 dyed crystal, silver lined
38183|s|D9A75A|4|Кришталь, жовта серединка, сфінкс|crystal, colour lined yellow, sfinx
47115|s|D5A775|4|Мушля|shell
02183|s|F79656|4|Алебастр, фарбований помаранчевим 2|orange 2 dyed alabaster
37383|s|D9A27B|4|Цейлон жовтий|ceylon yellow
02682|s|F59654|4|Алебастр, фарбований жовтим 3|yellow 3 dyed alabaster
38189|s|FA915C|4|Кришталь, помаранчева серединка, сфінкс|crystal, colour lined orange, sfinx
81060|s|F19812|4|Гіацинт, райдужний|hyacinth, rainbow
80898|s|F59271|4|Кришталь, фарбований жовтим, червона серединка|yellow dyed crystal, colour lined red
11070|s|F09636|4|Топаз, райдужний|topaz, rainbow
80883|s|DAA127|4|Кришталь, фарбований жовтим, жовта серединка|yellow dyed crystal, colour lined yellow
02182|s|D7A05B|4|Алебастр, фарбований жовтим 2|yellow 2 dyed alabaster
46112|s|CCA280|4|Мушля|shell
01285|s|F88E5F|4|Кришталь, фарбований помаранчевим 1|orange 1 dyed crystal
07712|s|D39D8F|4|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
17918|s|D0A076|4|Алебастр, фарбований коричневим перламутром терра|brown terra pearl dyed alabaster
01211|s|E39771|4|Кришталь, фарбований коричневим 1|brown 1 dyed crystal
85066|s|F4900A|4|Гіацинт, біла серединка|hyacinth, colour lined chalkwhite
17183|s|DD9C10|4|Алебастр, фарбований жовтим, глянець|yellow dyed alabaster, lustered
16050|s|DC9B4C|4|Топаз, сфінкс|topaz, sfinx
16717|s|C7A082|4|Крейдяно-білий, фарбований бежевим металіком|beige metallic dyed chalkwhite
41184|s|F88A5B|4|Кришталь, фарбований жовтим, райдужний|yellow dyed crystal, rainbow
03683|s|DD985F|4|Крейдяно-білий, фарбований помаранчевим 3|orange 3 dyed chalkwhite
16070|s|E29555|4|Топаз, сфінкс|topaz, sfinx
68506|s|C89E7A|4|Кришталь, бронзова серединка, райдужний|crystal, colour lined bronze, rainbow
02683|s|F38B4F|4|Алебастр, фарбований помаранчевим 3|orange 3 dyed alabaster
01681|s|D79B28|4|Кришталь, фарбований жовтим 3|yellow 3 dyed crystal
17389|s|E9904C|4|Цейлон помаранчевий|ceylon orange
02294|s|CC9B7E|4|Алебастр, фарбований рожевим 1|pink 1 dyed alabaster
15056|s|E5932D|4|Топаз, біла серединка|topaz, colour lined chalkwhite
11050|s|DF9534|4|Топаз, райдужний|topaz, rainbow
22005|s|EB8A64|4|Абрикосовий PermaLux|PermaLux dyed chalk, apricot
02184|s|E48C4F|4|Алебастр, фарбований помаранчевим 2|orange 2 dyed alabaster
81393|s|F28437|4|Прозорий бурштиново-жовтий, червона серединка, сфінкс|transp. yellow amber, colour lined red, sfinx
18184|s|C9976D|4|Помаранчевий металік, сольгель|orange solgel metallic
18581|s|C4995F|4|Кришталь, фарбований золотим металіком|gold metallic dyed crystal
78212|s|C6967E|4|Кришталь, фарбований коричневим 1, срібна серединка|brown 1 dyed crystal, silver lined
96000|s|F18142|4|Гіацинт, сфінкс|hyacinth, sfinx
97009|s|ED814B|4|Гіацинт, срібна серединка, райдужний|hyacinth, silver lined, rainbow
08789|s|F87948|4|Кришталь, неоново-помаранчева серединка|crystal, neon orange lined
22003|s|D48F3F|4|Жовто-коричневий PermaLux|PermaLux dyed chalk, yellow-brown
10020|r|D19125|4|Світлий топаз|lt. topaz
17992|s|D08E6B|4|Алебастр, фарбований помаранчевим перламутром терра|orange terra pearl dyed alabaster
01184|s|F87840|4|Кришталь, фарбований помаранчевим 2|orange 2 dyed crystal
02684|s|EE7E4F|4|Алебастр, фарбований помаранчевим 3|orange 3 dyed alabaster
03611|s|C19374|4|Крейдяно-білий, фарбований коричневим 3|brown 3 dyed chalkwhite
08288|s|C3916E|4|Кришталь, фарбований помаранчевим, срібна серединка|orange dyed crystal, silver lined
48018|s|C29265|4|Кришталь, помаранчевий глянець|crystal, orange lustered
18288|s|DB8739|4|Кришталь, фарбований помаранчевим, срібна серединка|orange dyed crystal, silver lined
17029|s|BB9464|4|Світлий топаз, срібна серединка, райдужний|lt. topaz, silver lined, rainbow
01182|s|DE8534|4|Кришталь, фарбований жовтим 2|yellow 2 dyed crystal
01212|s|D1896C|4|Кришталь, фарбований коричневим 1|brown 1 dyed crystal
98140|s|E97D4D|4|Непрозорий помаранчевий, сфінкс|opaque orange, sfinx
91000|s|EA7D36|4|Гіацинт, райдужний|hyacinth, rainbow
01183|s|EC7C26|4|Кришталь, фарбований помаранчевим 2|orange 2 dyed crystal
78183|s|CA8D4D|4|Кришталь, фарбований помаранчевим 2, срібна серединка|orange 2 dyed crystal, silver lined
07331|s|C58C7B|4|Рожева терра|Rose terra
68805|s|DD8167|4|Кришталь, фарбований під мідь|copper dyed crystal
96030|s|FB6E2E|4|Гіацинт, сфінкс|hyacinth, sfinx
78683|s|E1803B|4|Кришталь, фарбований помаранчевим 3, срібна серединка|orange 3 dyed crystal, silver lined
03684|s|D4855D|4|Крейдяно-білий, фарбований помаранчевим 3|orange 3 dyed chalkwhite
18389|s|E87A21|4|Золотий металік|gold metallic
68105|s|C68A65|4|Кришталь, мідна серединка|crystal, copper lined
01683|s|EE742A|4|Кришталь, фарбований помаранчевим 3|orange 3 dyed crystal
81391|s|EC7531|4|Прозорий бурштиново-жовтий, рожева серединка, сфінкс|transp. yellow amber, colour lined pink, sfinx
78682|s|D18446|4|Кришталь, фарбований жовтим 3, срібна серединка|yellow 3 dyed crystal, silver lined
66209|s|B88E42|4|Травертин на крейдяно-білому|travertine on chalkwhite
16189|s|F36B26|4|Крейдяно-білий, фарбований помаранчевим, сфінкс|orange dyed chalkwhite, sfinx
95006|s|F96609|4|Гіацинт, біла серединка|hyacinth, colour lined chalkwhite
22m03|s|CA853B|4|Жовто-коричневий PermaLux, матовий|PermaLux dyed chalk, yellow-brown, matt
15076|s|D77E21|4|Топаз, біла серединка|topaz, colour lined chalkwhite
78182|s|B98B49|4|Кришталь, фарбований жовтим 2, срібна серединка|yellow 2 dyed crystal, silver lined
02651|s|B28E40|4|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
93140|r|F7651F|4|Непрозорий помаранчевий|opaque orange
95036|s|FC5D11|4|Гіацинт, біла серединка|hyacinth, colour lined chalkwhite
16918|s|C18459|4|Крейдяно-білий, фарбований коричневим перламутром терра|brown terra pearl dyed chalkwhite
10705|r|C28539|4|Арлекін кришталево-топазовий|harlequin crystal-topaz
80060|r|CE7F0C|4|Гіацинт|hyacinth
68304|s|B8883D|4|Кришталь, справжня позолота|crystal, genuine gold plated
16A91|s|F95C33|4|Крейдяно-білий, насичено фарбований помаранчевим|orange intensive dyed chalkwhite
94140|s|F0652D|4|Непрозорий помаранчевий, райдужний|opaque orange, rainbow
17090|s|BA845E|4|Топаз, срібна серединка|topaz, silver lined
90000|r|E66C11|4|Гіацинт|hyacinth
08289|s|CB7B43|4|Кришталь, фарбований помаранчевим, срібна серединка|orange dyed crystal, silver lined
58589|s|DC6F50|4|Кришталь, помаранчева серединка, райдужний|crystal, colour lined orange, rainbow
01684|s|F25E24|4|Кришталь, фарбований помаранчевим 3|orange 3 dyed crystal
94110|s|E56A09|4|Непрозорий помаранчевий, райдужний|opaque orange, rainbow
10050|r|C97A19|4|Топаз|topaz
17050|s|B7823E|4|Топаз, срібна серединка|topaz, silver lined
78184|s|C27B58|4|Кришталь, фарбований помаранчевим 2, срібна серединка|orange 2 dyed crystal, silver lined
18289|s|E46715|4|Кришталь, фарбований помаранчевим, срібна серединка|orange dyed crystal, silver lined
81016|s|DC6C29|4|Прозорий бурштиново-жовтий, рожева серединка, сфінкс|transp. yellow amber, colour lined pink, sfinx
03685|s|C0795A|4|Крейдяно-білий, фарбований помаранчевим 3|orange 3 dyed chalkwhite
17189|s|D26D3A|4|Алебастр, фарбований помаранчевим, глянець|orange dyed alabaster, lustered
22004|s|E15F3D|4|Помаранчевий PermaLux|PermaLux dyed chalk, orange
02685|s|CE6C49|4|Алебастр, фарбований помаранчевим 3|orange 3 dyed alabaster
68388|s|AC7E47|4|Золотий ірис|gold iris
78684|s|D7662E|4|Кришталь, фарбований помаранчевим 3, срібна серединка|orange 3 dyed crystal, silver lined
78185|s|B8755A|4|Кришталь, фарбований помаранчевим 2, срібна серединка|orange 2 dyed crystal, silver lined
22m04|s|DE5A38|4|Помаранчевий PermaLux, матовий|PermaLux dyed chalk, orange, matt
01111|s|B7733E|4|Кришталь, фарбований коричневим 2|brown 2 dyed crystal
01112|s|C36B46|4|Кришталь, фарбований коричневим 2|brown 2 dyed crystal
01682|s|CA6625|4|Кришталь, фарбований жовтим 3|yellow 3 dyed crystal
46095|s|BA6D58|4|Крейдяно-білий, рожевий глянець|chalkwhite, rose lustered
16090|s|BC6B52|4|Топаз, сфінкс|topaz, sfinx
01185|s|CF5C33|4|Кришталь, фарбований помаранчевим 2|orange 2 dyed crystal
18983|s|B06C45|4|Кришталь, фарбований помаранчевим металіком|orange metallic dyed crystal
95004|s|D94F0D|4|Гіацинт, бронзова серединка|hyacinth, colour lined bronze
18583|s|A17148|4|Кришталь, фарбований золотим металіком|gold metallic dyed crystal
17705|s|AB6C37|4|Арлекін кришталево-топазовий, срібна серединка|harlequin crystal-topaz, silver lined
18388|s|A56F28|4|Золотий металік|gold metallic
78651|s|927439|4|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
48095|s|9E6442|4|Кришталь, рожевий глянець|crystal, rose lustered
83119|s|9A6424|4|Непрозорий жовтий «лимон», рожевий глянець|opaque yellow "limon", rose luster
78685|s|AF5530|4|Кришталь, фарбований помаранчевим 3, срібна серединка|orange 3 dyed crystal, silver lined
10070|r|A45619|4|Топаз|topaz
38395|s|E0CACA|5|Кришталь, червона серединка|crystal, colour lined red
38498|s|DEC6C4|5|Кришталь, червона серединка|crystal, colour lined red
68298|s|D6C3BE|5|Кришталь, червона металізована серединка|crystal, metallic colour lined red
38298|s|E1AFB0|5|Кришталь, червона перламутрова серединка|crystal, colour lined red pearl
03112|s|DBAFA5|5|Крейдяно-білий, фарбований коричневим 2|brown 2 dyed chalkwhite
02293|s|FAA0AA|5|Алебастр, фарбований червоним 1|red 1 dyed alabaster
03194|s|D6AEB5|5|Крейдяно-білий, фарбований рожевим 2|pink 2 dyed chalkwhite
80998|s|F99FA9|5|Кришталь, фарбований червоним, червона серединка|red dyed crystal, colour lined red
78291|s|F6A09B|5|Кришталь, фарбований червоним 1, срібна серединка|red 1 dyed crystal, silver lined
38389|s|F59B86|5|Кришталь, помаранчева серединка|crystal, colour lined orange
38327|s|CAAAAF|5|Кришталь, фіолетова серединка|crystal, colour lined violet
03191|s|F99396|5|Крейдяно-білий, фарбований червоним 2|red 2 dyed chalkwhite
37173|s|E29CA7|5|Цейлон рожевий|ceylon pink
38689|s|F19582|5|Кришталь, помаранчева серединка, сфінкс|crystal, colour lined orange, sfinx
02291|s|F6908A|5|Алебастр, фарбований червоним 1|red 1 dyed alabaster
09351|s|FD8D7B|5|Крейдяно-білий, фарбований кораловим|coraline dyed chalkwhite
07112|s|DA9D95|5|Кришталь, фарбований рожевим, райдужний|pink dyed crystal, rainbow
78293|s|E4969C|5|Кришталь, фарбований червоним 1, срібна серединка|red 1 dyed crystal, silver lined
78213|s|C2A4A4|5|Кришталь, фарбований коричневим 1, срібна серединка|brown 1 dyed crystal, silver lined
02185|s|F68E77|5|Алебастр, фарбований помаранчевим 2|orange 2 dyed alabaster
22m10|s|E6929C|5|Світло-рожевий PermaLux, матовий|PermaLux dyed chalk, lt. pink, matt
43191|s|FB868E|5|Крейдяно-білий, фарбований рожевим, райдужний|pink dyed chalkwhite, rainbow
78294|s|CA9D98|5|Кришталь, фарбований рожевим 1, срібна серединка|pink 1 dyed crystal, silver lined
09451|s|FB8370|5|Крейдяно-білий, фарбований кораловим, райдужний|coraline dyed chalkwhite, rainbow
01213|s|D1969A|5|Кришталь, фарбований коричневим 1|brown 1 dyed crystal
38196|s|E68AA0|5|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
08273|s|C99A8F|5|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
01294|s|CD9792|5|Кришталь, фарбований рожевим 1|pink 1 dyed crystal
38695|s|DD8F95|5|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
18191|s|DF8E93|5|Рожевий металік, сольгель|pink solgel metallic
38698|s|F57B99|5|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
37398|s|D09196|5|Цейлон рожевий|ceylon pink
38697|s|F08084|5|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
03093|s|D68E83|5|Кришталь, фарбований рожевим|pink dyed crystal
01291|s|FB7969|5|Кришталь, фарбований червоним 1|red 1 dyed crystal
18192|s|BE9595|5|Червоний металік, сольгель|red solgel metallic
01293|s|EC7C84|5|Кришталь, фарбований червоним 1|red 1 dyed crystal
18123|s|B4959C|5|Фіолетовий металік, сольгель|violet solgel metallic
97050|s|ED7A5F|5|Прозорий світло-червоний, срібна серединка|transp. lt. red, silver lined
78295|s|BF8D98|5|Кришталь, фарбований фіолетовим 1, срібна серединка|violet 1 dyed crystal, silver lined
02191|s|EF7278|5|Алебастр, фарбований червоним 2|red 2 dyed alabaster
03691|s|E5778B|5|Крейдяно-білий, фарбований рожевим 3|pink 3 dyed chalkwhite
22m09|s|E97676|5|Рожевий PermaLux, матовий|PermaLux dyed chalk, pink, matt
97090|s|D08483|5|Рубін, срібна серединка|ruby, silver lined
22009|s|ED726E|5|Рожевий PermaLux|PermaLux dyed chalk, pink
01191|s|FE625A|5|Кришталь, фарбований червоним 2|red 2 dyed crystal
38116|s|B08E8B|5|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
96050|s|F76752|5|Прозорий світло-червоний, сфінкс|transp. lt. red, sfinx
02691|s|F66467|5|Алебастр, фарбований рожевим 3|pink 3 dyed alabaster
58516|s|AB8B8B|5|Кришталь, коричнева серединка, райдужний|crystal, colour lined brown, rainbow
22010|s|E66B79|5|Світло-рожевий PermaLux|PermaLux dyed chalk, lt. pink
07022|s|DC736B|5|Кришталь, фарбований рожевим|pink dyed crystal
38117|s|B28783|5|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
38889|s|DF706B|5|Кришталь, помаранчева серединка, сфінкс|crystal, colour lined orange, sfinx
08275|s|CA7A88|5|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
18598|s|CF7783|5|Кришталь, фарбований червоним металіком|red metallic dyed crystal
41191|s|F35B5A|5|Кришталь, фарбований червоним, райдужний|red dyed crystal, rainbow
17398|s|E16779|5|Цейлон рожевий|ceylon pink
26970|s|D96F63|5|Крейдяно-білий, м'який коралово-червоний|chalkwhite, soft coral red
63191|s|DB6B6B|5|Крейдяно-білий, фарбований рожевим 2, сфінкс|pink 2 dyed chalkwhite, sfinx
03694|s|A88486|5|Крейдяно-білий, фарбований рожевим 3|pink 3 dyed chalkwhite
11398|s|C97668|5|Світлий топаз, червона серединка, сфінкс|lt. topaz, colour lined red, sfinx
18996|s|D8687E|5|Кришталь, фарбований фіолетовим металіком|violet metallic dyed crystal
22m06|s|BF7770|5|Світло-коричневий PermaLux, матовий|PermaLux dyed chalk, lt. brown, matt
68498|s|C47171|5|Кришталь, рожева металізована серединка, райдужний|crystal, metallic colour lined pink, rainbow
95056|s|FC4216|5|Прозорий світло-червоний, біла серединка|transp. lt. red, colour lined chalkwhite
97079|s|CB6C6C|5|Прозорий червоний, срібна серединка, райдужний|transp. red, silver lined, rainbow
91070|s|F04B54|5|Прозорий червоний, райдужний|transp. red, rainbow
91050|s|F14C35|5|Прозорий світло-червоний, райдужний|transp. lt. red, rainbow
11028|s|D3645B|5|Світлий топаз, рожева серединка, сфінкс|lt. topaz, colour lined pink, sfinx
91030|s|EC4E35|5|Гіацинт, райдужний|hyacinth, rainbow
38397|s|E75055|5|Кришталь, червона серединка|crystal, colour lined red
17899|s|F33F46|5|Алебастр, фарбований рожевим|pink dyed alabaster
07622|s|CB665F|5|Кришталь, фарбований рожевим, сфінкс|pink dyed crystal, sfinx
01691|s|F3412C|5|Кришталь, фарбований рожевим 3|pink 3 dyed crystal
93141|s|E2553E|5|Непрозорий помаранчевий, жовто-коричневий глянець|opaque orange, yellow-brown luster
38198|s|B2727A|5|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
11396|s|D35E49|5|Світлий топаз, червона серединка, сфінкс|lt. topaz, colour lined red, sfinx
16A98|s|F53445|5|Крейдяно-білий, насичено фарбований червоним|red intensive dyed chalkwhite
90030|r|EE412A|5|Гіацинт|hyacinth
38398|s|E14C65|5|Кришталь, червона серединка|crystal, colour lined red
07122|s|CB6252|5|Кришталь, фарбований рожевим, райдужний|pink dyed crystal, rainbow
22006|s|BC6A56|5|Світло-коричневий PermaLux|PermaLux dyed chalk, lt. brown
22008|s|E8443E|5|Червоний PermaLux|PermaLux dyed chalk, red
62191|s|D3585E|5|Алебастр, фарбований рожевим 2, сфінкс|pink 2 dyed alabaster, sfinx
23020|r|9A7776|5|Непрозорий фіолетовий|opaque violet
03613|s|997774|5|Крейдяно-білий, фарбований коричневим 3|brown 3 dyed chalkwhite
98170|s|E83D43|5|Непрозорий коралово-червоний, сфінкс|opaque red coral, sfinx
11027|s|D44F6E|5|Світлий топаз, рожева серединка, сфінкс|lt. topaz, colour lined pink, sfinx
22m08|s|DA4959|5|Червоний PermaLux, матовий|PermaLux dyed chalk, red, matt
08A91|s|D84C46|5|Кришталь, насичена помаранчева серединка|crystal, intensive orange lined
61191|s|D64D4E|5|Кришталь, фарбований рожевим 2, сфінкс|pink 2 dyed crystal, sfinx
95076|s|EE2B27|5|Прозорий червоний, біла серединка|transp. red, colour lined chalkwhite
58517|s|947378|5|Кришталь, коричнева серединка, райдужний|crystal, colour lined brown, rainbow
94190|s|D34952|5|Непрозорий коралово-червоний, райдужний|opaque red coral, rainbow
78195|s|9B6872|5|Кришталь, фарбований фіолетовим 2, срібна серединка|violet 2 dyed crystal, silver lined
22m11|s|D53D4E|5|Фуксієвий PermaLux, матовий|PermaLux dyed chalk, fuchsia, matt
78113|s|8F6D6D|5|Кришталь, фарбований коричневим 2, срібна серединка|brown 2 dyed crystal, silver lined
78691|s|D0423C|5|Кришталь, фарбований рожевим 3, срібна серединка|pink 3 dyed crystal, silver lined
01760|s|936963|5|М'яка мідь|soft copper
02693|s|B8535A|5|Алебастр, фарбований рожевим 3|pink 3 dyed alabaster
93170|r|D6342A|5|Непрозорий коралово-червоний|opaque red coral
58142|s|8A6B67|5|Кришталь, бронзовий глянець|crystal, bronze lustered
38118|s|8C696A|5|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
08A98|s|CB3B4B|5|Кришталь, насичена червона серединка|crystal, intensive red lined
90050|r|D2311E|5|Прозорий світло-червоний|transp. lt.red
97120|s|8C6663|5|Гранат, срібна серединка|garnet, silver lined
02694|s|9A6058|5|Алебастр, фарбований рожевим 3|pink 3 dyed alabaster
96090|s|BB484F|5|Рубін, сфінкс|ruby, sfinx
87797|s|BB4A2F|5|Арлекін червоно-жовтий, срібна серединка|harlequin red-yellow, silver lined
81797|r|CA3627|5|Арлекін червоно-жовтий|harlequin red-yellow
02193|s|A7515F|5|Алебастр, фарбований червоним 2|red 2 dyed alabaster
01113|s|925E5C|5|Кришталь, фарбований коричневим 2|brown 2 dyed crystal
02113|s|846263|5|Алебастр, фарбований коричневим 2|brown 2 dyed alabaster
48025|s|7E6266|5|Кришталь, бузковий глянець|crystal, lila lustered
98190|s|AD4755|5|Непрозорий коралово-червоний, сфінкс|opaque red coral, sfinx
07722|s|A94B50|5|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
94170|s|C52C29|5|Непрозорий коралово-червоний, райдужний|opaque red coral, rainbow
78193|s|9B534C|5|Кришталь, фарбований червоним 2, срібна серединка|red 2 dyed crystal, silver lined
01193|s|B04054|5|Кришталь, фарбований червоним 2|red 2 dyed crystal
18398|s|AF414B|5|Червоний металік|red metallic
96070|s|B03E50|5|Прозорий червоний, сфінкс|transp. red, sfinx
18298|s|B83643|5|Кришталь, фарбований червоним, срібна серединка|red dyed crystal, silver lined
02613|s|865B51|5|Алебастр, фарбований коричневим 3|brown 3 dyed alabaster
58518|s|7B5E5F|5|Кришталь, коричнева серединка, райдужний|crystal, colour lined brown, rainbow
78191|s|A24944|5|Кришталь, фарбований червоним 2, срібна серединка|red 2 dyed crystal, silver lined
91090|s|B23648|5|Рубін, райдужний|ruby, rainbow
38319|s|765C60|5|Кришталь, коричнева серединка|crystal, colour lined brown
23040|r|765958|5|Непрозорий темно-фіолетовий|opaque dark violet
26960|s|A53B45|5|Червоний перламутр|
01613|s|865144|5|Кришталь, фарбований коричневим 3|brown 3 dyed crystal
78693|s|A33B3C|5|Кришталь, фарбований рожевим 3, срібна серединка|pink 3 dyed crystal, silver lined
93190|r|B71F27|5|Непрозорий коралово-червоний|opaque red coral
78613|s|7B544C|5|Кришталь, фарбований коричневим 3, срібна серединка|brown 3 dyed crystal, silver lined
80489|s|874D42|5|Кришталь, фарбований сірим, помаранчева серединка|grey dyed crystal, colour lined orange
16A19|s|874C40|5|Крейдяно-білий, насичено фарбований темно-коричневим|dark brown intensive dyed chalkwhite
98210|s|A13646|5|Непрозорий коралово-червоний, сфінкс|opaque red coral, sfinx
93870|s|A4332F|5|Корал, фарбований червоним|red dyed coral
22007|s|944230|5|Коричневий PermaLux|PermaLux dyed chalk, brown
11110|s|7C4A42|5|Темний топаз, райдужний|dark topaz, rainbow
90070|r|AB191B|5|Прозорий червоний|transp. red
07522|s|874334|5|Кришталь, фарбований рожевим, мідна серединка|pink dyed crystal, copper lined
16A18|s|953538|5|Крейдяно-білий, насичено фарбований коричневим|brown intensive dyed chalkwhite
18600|s|704C4C|5|Непрозорий коричневий «танго», сфінкс|opaque brown "tango", sfinx
01780|s|76494A|5|М'яка мідь|soft copper
22m07|s|8B3D2B|6|Коричневий PermaLux, матовий|PermaLux dyed chalk, brown, matt
78694|s|7F443D|6|Кришталь, фарбований рожевим 3, срібна серединка|pink 3 dyed crystal, silver lined
78695|s|7B4358|6|Кришталь, фарбований фіолетовим 3, срібна серединка|violet 3 dyed crystal, silver lined
18325|s|8A2D61|6|Фіолетовий металік|violet metallic
01693|s|8B323A|6|Кришталь, фарбований рожевим 3|pink 3 dyed crystal
95074|s|9A211A|6|Прозорий червоний, бронзова серединка|transp. red, bronze lined
93195|s|684842|6|Непрозорий коралово-червоний, зелений глянець|opaque red coral, green luster
78622|s|604657|6|Кришталь, фарбований фіолетовим 3, срібна серединка|violet 3 dyed crystal, silver lined
97070|s|95201F|6|Прозорий червоний, срібна серединка|transp. red, silver lined
01750|s|773D34|6|М'яка темна мідь|soft dk.copper
96120|s|7F3445|6|Гранат, сфінкс|garnet, sfinx
94210|s|902429|6|Непрозорий коралово-червоний, райдужний|opaque red coral, rainbow
01194|s|763B36|6|Кришталь, фарбований рожевим 2|pink 2 dyed crystal
91120|s|8C2538|6|Гранат, райдужний|garnet, rainbow
01695|s|6E3C49|6|Кришталь, фарбований фіолетовим 3|violet 3 dyed crystal
21060|s|634244|6|Аметист, райдужний|amethyst, rainbow
08A18|s|6D3C3D|6|Кришталь, насичена коричнева серединка|crystal, intensive brown lined
07512|s|6B3E32|6|Кришталь, фарбований рожевим, мідна серединка|pink dyed crystal, copper lined
29010|s|5D424B|6|Світлий аметист, мідна серединка|lt. amethyst, copper lined
97522|s|5D4140|6|Кришталь, фарбований рожевим, мідна серединка, райдужний|pink dyed crystal, copper lined, rainbow
01694|s|6D3839|6|Кришталь, фарбований рожевим 3|pink 3 dyed crystal
98310|s|76303E|6|Непрозорий коралово-червоний, сфінкс|opaque red coral, sfinx
91028|s|862014|6|Гіацинт, фіолетова серединка|hyacinth, colour lined violet
14600|s|70323A|6|Непрозорий коричневий «танго», райдужний|opaque brown "tango", rainbow
90090|r|881517|6|Рубін|ruby
93210|r|821C1B|6|Непрозорий коралово-червоний|opaque red coral
98300|s|5B3840|6|Непрозорий коралово-червоний, сфінкс|opaque red coral, sfinx
25086|s|4D3A42|6|Темний аметист, біла серединка|dark amethyst, colour lined chalkwhite
24040|s|4B3841|6|Непрозорий темно-фіолетовий, райдужний|opaque dark violet, rainbow
93192|s|5B322D|6|Непрозорий коралово-червоний, бузковий глянець|opaque red coral, lila luster
01790|s|49313D|6|М'який червоний|soft red
93300|r|5D2728|6|Непрозорий коралово-червоний|opaque red coral
94310|s|622229|6|Непрозорий коралово-червоний, райдужний|opaque red coral, rainbow
94300|s|532624|6|Непрозорий коралово-червоний, райдужний|opaque red coral, rainbow
93310|r|4D2828|6|Непрозорий коралово-червоний|opaque red coral
99190|s|472B22|6|Травертин на непрозорому коралово-червоному|travertine on opaque red coral
90120|r|3D1313|6|Гранат|garnet
73420|r|F4E0E2|7|Непрозорий рожевий|opaque pink
08198|s|E9E0D9|7|Кришталь, фарбований рожевим перламутром терра|pink terra pearl dyed crystal
16172|s|FACDE8|7|Крейдяно-білий, фарбований рожевим, сфінкс|pink dyed chalkwhite, sfinx
78420|s|E3D5DB|7|Непрозорий рожевий, сфінкс|opaque pink, sfinx
38126|s|FBC9E7|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
03491|s|FACBCF|7|Кришталь, фарбований рожевим|pink dyed crystal
74420|s|E7D0D6|7|Непрозорий рожевий, райдужний|opaque pink, rainbow
07612|s|E2D0CC|7|Кришталь, фарбований рожевим, сфінкс|pink dyed crystal, sfinx
38173|s|F8C4D9|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
38694|s|F5C2D6|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
17173|s|FBB6D6|7|Алебастр, фарбований рожевим, глянець|pink dyed alabaster, lustered
382PP|s|F2BCBC|7|Кришталь, рожева перламутрова серединка, сфінкс|crystal, colour lined pink pearl, sfinx
58573|s|F9B4E4|7|Кришталь, рожева серединка, райдужний|crystal, colour lined pink, rainbow
03293|s|F5B7D3|7|Крейдяно-білий, фарбований червоним 1|red 1 dyed chalkwhite
02292|s|FBAFE1|7|Алебастр, фарбований рожевим 1|pink 1 dyed alabaster
03291|s|F8B4C3|7|Крейдяно-білий, фарбований червоним 1|red 1 dyed chalkwhite
03285|s|E4BCB7|7|Крейдяно-білий, фарбований помаранчевим 1|orange 1 dyed chalkwhite
02213|s|E0BBC1|7|Алебастр, фарбований коричневим 1|brown 1 dyed alabaster
38998|s|F3B0B4|7|Кришталь, червона перламутрова серединка|crystal, colour lined red pearl
38626|s|D7B7CD|7|Кришталь, фіолетова серединка, сфінкс|crystal, colour lined violet, sfinx
03294|s|D2B8C1|7|Крейдяно-білий, фарбований рожевим 1|pink 1 dyed chalkwhite
38325|s|D8B5C5|7|Кришталь, фіолетова серединка|crystal, colour lined violet
03193|s|F3A5BD|7|Крейдяно-білий, фарбований червоним 2|red 2 dyed chalkwhite
57573|s|F89CC4|7|Білий алебастр, рожева серединка, райдужний|alabaster white, colour lined pink, rainbow
02295|s|DEA8C4|7|Алебастр, фарбований фіолетовим 1|violet 1 dyed alabaster
03192|s|F09CD4|7|Крейдяно-білий, фарбований рожевим 2|pink 2 dyed chalkwhite
37177|s|EB9ED5|7|Цейлон рожевий|ceylon pink
37325|s|D1A8BC|7|Цейлон фіолетовий|ceylon violet
38194|s|E69FB5|7|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
17298|s|DBA3BC|7|Алебастр, фарбований рожевим перламутром терра|pink terra pearl dyed alabaster
23730|s|EA98B6|7|Рожевий перламутр|
38625|s|E198C6|7|Кришталь, фіолетова серединка, сфінкс|crystal, colour lined violet, sfinx
38123|s|F688D4|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
78222|s|BEA6B4|7|Кришталь, фарбований фіолетовим 1, срібна серединка|violet 1 dyed crystal, silver lined
78292|s|DA99B8|7|Кришталь, фарбований рожевим 1, срібна серединка|pink 1 dyed crystal, silver lined
01292|s|F383CB|7|Кришталь, фарбований рожевим 1|pink 1 dyed crystal
18273|s|EB8CAB|7|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
37175|s|E28EB7|7|Цейлон рожевий|ceylon pink
58594|s|D891A3|7|Кришталь, рожева серединка, райдужний|crystal, colour lined pink, rainbow
37328|s|BF98B5|7|Цейлон фіолетовий|ceylon violet
16398|s|E984AA|7|Крейдяно-білий, фарбований рожевим, сфінкс|pink dyed chalkwhite, sfinx
37126|s|D48FAE|7|Цейлон фіолетовий|ceylon violet
38175|s|F47BB2|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
38124|s|E880B7|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
01295|s|CD8EB1|7|Кришталь, фарбований фіолетовим 1|violet 1 dyed crystal
38627|s|CB8CA9|7|Кришталь, фіолетова серединка, сфінкс|crystal, colour lined violet, sfinx
18595|s|BD8E9B|7|Кришталь, фарбований рожевим металіком|pink metallic dyed crystal
38628|s|B889AB|7|Кришталь, фіолетова серединка, сфінкс|crystal, colour lined violet, sfinx
18998|s|C68297|7|Кришталь, фарбований рожевим металіком|pink metallic dyed crystal
01192|s|E562C3|7|Кришталь, фарбований рожевим 2|pink 2 dyed crystal
08277|s|CB7799|7|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
18275|s|EA5CA3|7|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
16A26|s|F24DB4|7|Крейдяно-білий, насичено фарбований рожевим|pink intensive dyed chalkwhite
08777|s|F55185|7|Кришталь, неоново-рожева серединка|crystal, neon pink lined
22m12|s|C37596|7|Фіолетовий PermaLux, матовий|PermaLux dyed chalk, violet, matt
25016|s|A08493|7|Світлий аметист, біла серединка|lt. amethyst, colour lined chalkwhite
16A77|s|F24C8D|7|Крейдяно-білий, насичено фарбований рожевим|pink intensive dyed chalkwhite
38177|s|E2589E|7|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
28020|s|9B8089|7|Непрозорий фіолетовий, сфінкс|opaque violet, sfinx
02692|s|D1608A|7|Алебастр, фарбований рожевим 3|pink 3 dyed alabaster
22012|s|C16B88|7|Фіолетовий PermaLux|PermaLux dyed chalk, violet
21010|s|A07B8B|7|Світлий аметист, райдужний|lt. amethyst, rainbow
03692|s|BA66A0|7|Крейдяно-білий, фарбований рожевим 3|pink 3 dyed chalkwhite
02192|s|B6649F|7|Алебастр, фарбований рожевим 2|pink 2 dyed alabaster
22011|s|DE3C6A|7|Фуксієвий PermaLux|PermaLux dyed chalk, fuchsia
03693|s|AF6380|7|Крейдяно-білий, фарбований рожевим 3|pink 3 dyed chalkwhite
17125|s|BC549F|7|Алебастр, фарбований фіолетовим, глянець|violet dyed alabaster, lustered
24020|s|996C87|7|Непрозорий фіолетовий, райдужний|opaque violet, rainbow
41192|s|AE5C91|7|Кришталь, фарбований червоним, райдужний|red dyed crystal, rainbow
38898|s|B25883|7|Кришталь, червона серединка, сфінкс|crystal, colour lined red, sfinx
02695|s|9D6172|7|Алебастр, фарбований фіолетовим 3|violet 3 dyed alabaster
78692|s|BD4479|7|Кришталь, фарбований рожевим 3, срібна серединка|pink 3 dyed crystal, silver lined
08A77|s|C13C5F|7|Кришталь, насичена рожева серединка|crystal, intensive pink lined
17998|s|B4447B|7|Алебастр, фарбований рожевим перламутром терра|pink terra pearl dyed alabaster
78192|s|A84E6F|7|Кришталь, фарбований рожевим 2, срібна серединка|pink 2 dyed crystal, silver lined
18377|s|B33B8E|7|Рожевий металік|pink metallic
02195|s|8F5A79|7|Алебастр, фарбований фіолетовим 2|violet 2 dyed alabaster
08225|s|9B4F7D|7|Кришталь, фарбований фіолетовим, срібна серединка|violet dyed crystal, silver lined
08298|s|A8466F|7|Кришталь, фарбований рожевим, срібна серединка|pink dyed crystal, silver lined
16198|s|A54965|7|Крейдяно-білий, фарбований червоним, сфінкс|red dyed chalkwhite, sfinx
02194|s|89596B|7|Алебастр, фарбований рожевим 2|pink 2 dyed alabaster
02622|s|76616C|7|Алебастр, фарбований фіолетовим 3|violet 3 dyed alabaster
58598|s|A04B63|7|Кришталь, червона серединка, райдужний|crystal, colour lined red, rainbow
80628|s|7D5572|7|Кришталь, фарбований зеленим, фіолетова серединка|green dyed crystal, colour lined violet
01692|s|AC2176|7|Кришталь, фарбований рожевим 3|pink 3 dyed crystal
08A26|s|A2336A|7|Кришталь, насичена рожева серединка|crystal, intensive pink lined
38099|s|755361|7|Кришталь, червона серединка|crystal, colour lined red
78122|s|6D5463|7|Кришталь, фарбований фіолетовим 2, срібна серединка|violet 2 dyed crystal, silver lined
22m13|s|94395D|7|Пурпуровий PermaLux, матовий|PermaLux dyed chalk, purple, matt
01195|s|804762|7|Кришталь, фарбований фіолетовим 2|violet 2 dyed crystal
22013|s|983654|7|Пурпуровий PermaLux|PermaLux dyed chalk, purple
25066|s|6E5062|7|Аметист, біла серединка|amethyst, colour lined chalkwhite
20010|r|704F5F|7|Світлий аметист|lt. amethyst
14780|s|704B55|7|Непрозорий коричневий «танго», райдужний|opaque brown "tango", rainbow
26210|s|E2D5E3|8|Крейдяно-білий, фарбований м'яким фіолетовим перламутром|soft pearl violet dyed chalkwhite
23420|r|DCD4EA|8|Непрозорий бузковий|opaque lilac
08128|s|DCD1D8|8|Кришталь, фарбований фіолетовим перламутром терра|violet terra pearl dyed crystal
03292|s|F1BAEB|8|Крейдяно-білий, фарбований рожевим 1|pink 1 dyed chalkwhite
58526|s|F3B7E7|8|Кришталь, фіолетова серединка, райдужний|crystal, colour lined violet, rainbow
02222|s|D5C3E0|8|Алебастр, фарбований фіолетовим 1|violet 1 dyed alabaster
58523|s|F99FED|8|Кришталь, фіолетова серединка, райдужний|crystal, colour lined violet, rainbow
24420|s|C3B6D4|8|Непрозорий бузковий, райдужний|opaque lilac, rainbow
28420|s|C1B5BD|8|Непрозорий бузковий, сфінкс|opaque lilac, sfinx
03295|s|CEACC9|8|Крейдяно-білий, фарбований фіолетовим 1|violet 1 dyed chalkwhite
78221|s|BCB2C5|8|Кришталь, фарбований фіолетовим 1, срібна серединка|violet 1 dyed crystal, silver lined
57526|s|E1A1D6|8|Білий алебастр, фіолетова серединка, райдужний|alabaster white, colour lined violet, rainbow
38328|s|C6ADC0|8|Кришталь, фіолетова серединка|crystal, colour lined violet
03123|s|C2A6EF|8|Крейдяно-білий, фарбований фіолетовим 2|violet 2 dyed chalkwhite
61006|s|BEAAD9|8|Світлий аквамарин, рожева серединка, сфінкс|lt. aquamarine, colour lined pink, sfinx
03195|s|D2A3C9|8|Крейдяно-білий, фарбований фіолетовим 2|violet 2 dyed chalkwhite
16173|s|EF90DF|8|Крейдяно-білий, фарбований рожевим, сфінкс|pink dyed chalkwhite, sfinx
03121|s|B4ABCC|8|Крейдяно-білий, фарбований фіолетовим 2|violet 2 dyed chalkwhite
03122|s|BFA7CE|8|Крейдяно-білий, фарбований фіолетовим 2|violet 2 dyed chalkwhite
16228|s|B9A7B6|8|Крейдяно-білий, фарбований фіолетовим перламутром терра|violet terra pearl dyed chalkwhite
78223|s|B9A0CD|8|Кришталь, фарбований фіолетовим 1, срібна серединка|violet 1 dyed crystal, silver lined
02223|s|C49ACB|8|Алебастр, фарбований фіолетовим 1|violet 1 dyed alabaster
18225|s|E587DB|8|Кришталь, фарбований фіолетовим, срібна серединка|violet dyed crystal, silver lined
37128|s|BD98CD|8|Цейлон фіолетовий|ceylon violet
38127|s|D488DA|8|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
58577|s|E47FD1|8|Кришталь, рожева серединка, райдужний|crystal, colour lined pink, rainbow
38928|s|A69DBE|8|Кришталь, фіолетова перламутрова серединка|crystal, colour lined violet pearl
01223|s|B58CED|8|Кришталь, фарбований фіолетовим 1|violet 1 dyed crystal
58525|s|DA7DD5|8|Кришталь, фіолетова серединка, райдужний|crystal, colour lined violet, rainbow
58528|s|C185DA|8|Кришталь, фіолетова серединка, райдужний|crystal, colour lined violet, rainbow
16728|s|A692CD|8|Крейдяно-білий, фарбований фіолетовим металіком|violet metallic dyed chalkwhite
38877|s|DC74D5|8|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
16177|s|FA57D9|8|Крейдяно-білий, фарбований рожевим, сфінкс|pink dyed chalkwhite, sfinx
41123|s|AA89D1|8|Кришталь, фарбований фіолетовим, райдужний|violet dyed crystal, rainbow
68228|s|968898|8|Кришталь, фіолетова металізована серединка|crystal, metallic colour lined violet
26010|s|9D849E|8|Світлий аметист, сфінкс|lt. amethyst, sfinx
68428|s|9486A7|8|Кришталь, фіолетова металізована серединка, райдужний|crystal, metallic colour lined violet, rainbow
01222|s|A180AE|8|Кришталь, фарбований фіолетовим 1|violet 1 dyed crystal
16325|s|BC6FB5|8|Крейдяно-білий, фарбований фіолетовим, сфінкс|violet dyed chalkwhite, sfinx
16125|s|CC5BCA|8|Крейдяно-білий, фарбований фіолетовим, сфінкс|violet dyed chalkwhite, sfinx
16328|s|957AC4|8|Крейдяно-білий, фарбований фіолетовим, сфінкс|violet dyed chalkwhite, sfinx
38125|s|BB66B4|8|Кришталь, рожева серединка, сфінкс|crystal, colour lined pink, sfinx
22m14|s|937AAA|8|Лавандовий PermaLux, матовий|PermaLux dyed chalk, levander, matt
38326|s|A86CB4|8|Кришталь, фіолетова серединка|crystal, colour lined violet
17728|s|8B77BA|8|Алебастр, фарбований фіолетовим металіком|violet metallic dyed alabaster
38128|s|A063C5|8|Кришталь, фіолетова серединка, сфінкс|crystal, colour lined violet, sfinx
03695|s|996C98|8|Крейдяно-білий, фарбований фіолетовим 3|violet 3 dyed chalkwhite
17325|s|A060A6|8|Цейлон фіолетовий|ceylon violet
38828|s|806BB7|8|Кришталь, фіолетова серединка, сфінкс|crystal, colour lined violet, sfinx
18528|s|8F688C|8|Кришталь, фарбований фіолетовим металіком|violet metallic dyed crystal
02121|s|7E707C|8|Алебастр, фарбований фіолетовим 2|violet 2 dyed alabaster
16128|s|885DC9|8|Крейдяно-білий, фарбований фіолетовим, сфінкс|violet dyed chalkwhite, sfinx
03621|s|786E80|8|Крейдяно-білий, фарбований фіолетовим 3|violet 3 dyed chalkwhite
08228|s|85658B|8|Кришталь, фарбований фіолетовим, срібна серединка|violet dyed crystal, silver lined
18928|s|836393|8|Кришталь, фарбований фіолетовим металіком|violet metallic dyed crystal
18228|s|9157AA|8|Кришталь, фарбований фіолетовим, срібна серединка|violet dyed crystal, silver lined
02621|s|7A6A75|8|Алебастр, фарбований фіолетовим 3|violet 3 dyed alabaster
22014|s|7A6493|8|Лавандовий PermaLux|PermaLux dyed chalk, levander
17328|s|835CA7|8|Цейлон фіолетовий|ceylon violet
28040|s|746977|8|Непрозорий темно-фіолетовий, сфінкс|opaque dark violet, sfinx
02623|s|855D99|8|Алебастр, фарбований фіолетовим 3|violet 3 dyed alabaster
03622|s|75657D|8|Крейдяно-білий, фарбований фіолетовим 3|violet 3 dyed chalkwhite
08728|s|9F498D|8|Кришталь, неоново-фіолетова серединка|crystal, neon violet lined
03623|s|7F5A97|8|Крейдяно-білий, фарбований фіолетовим 3|violet 3 dyed chalkwhite
78121|s|71656D|8|Кришталь, фарбований фіолетовим 2, срібна серединка|violet 2 dyed crystal, silver lined
27060|s|76626B|8|Аметист, срібна серединка|amethyst, silver lined
01121|s|6A6374|8|Кришталь, фарбований фіолетовим 2|violet 2 dyed crystal
27019|s|6E6074|8|Світлий аметист, срібна серединка, райдужний|lt. amethyst, silver lined, rainbow
02123|s|825099|8|Алебастр, фарбований фіолетовим 2|violet 2 dyed alabaster
78621|s|6F5F6D|8|Кришталь, фарбований фіолетовим 3, срібна серединка|violet 3 dyed crystal, silver lined
17796|s|854C86|8|Алебастр, фарбований фіолетовим металіком|violet metallic dyed alabaster
02122|s|70556A|8|Алебастр, фарбований фіолетовим 2|violet 2 dyed alabaster
26060|s|6B585B|8|Аметист, сфінкс|amethyst, sfinx
01125|s|714A9B|8|Кришталь, фарбований фіолетовим 2|violet 2 dyed crystal
63022|s|61557D|8|Бірюза, бузковий глянець|turquoise, lila lustered
16A28|s|6D45A6|8|Крейдяно-білий, насичено фарбований фіолетовим|violet intensive dyed chalkwhite
46025|s|714D6C|8|Крейдяно-білий, бузковий глянець|chalkwhite, lila lustered
01123|s|7B37A5|8|Кришталь, фарбований фіолетовим 2|violet 2 dyed crystal
78123|s|664664|8|Кришталь, фарбований фіолетовим 2, срібна серединка|violet 2 dyed crystal, silver lined
01122|s|5C486D|8|Кришталь, фарбований фіолетовим 2|violet 2 dyed crystal
21080|s|544753|8|Темний аметист, райдужний|dark amethyst, rainbow
38029|s|5D3C55|8|Кришталь, фіолетова серединка|crystal, colour lined violet
22015|s|4E3E6D|8|Темно-фіолетовий PermaLux|PermaLux dyed chalk, dark violet
18328|s|50357B|8|Фіолетовий металік|violet metallic
01623|s|622482|8|Кришталь, фарбований фіолетовим 3|violet 3 dyed crystal
78623|s|5D3062|8|Кришталь, фарбований фіолетовим 3, срібна серединка|violet 3 dyed crystal, silver lined
33062|s|4A3B4F|8|Непрозорий синій, бузковий глянець|opaque blue, lila luster
25014|s|483B33|8|Світлий аметист, бронзова серединка|lt. amethyst, bronze lined
01622|s|46384A|8|Кришталь, фарбований фіолетовим 3|violet 3 dyed crystal
22m15|s|3D2E64|8|Темно-фіолетовий PermaLux, матовий|PermaLux dyed chalk, dark violet, matt
28928|s|33323C|8|Чорний, фарбований фіолетовим перламутром|violet pearl dyed black
20060|r|35262C|8|Аметист|amethyst
20080|r|302529|8|Темний аметист|dark amethyst
01232|s|67AAE4|9|Кришталь, фарбований синім 1|blue 1 dyed crystal
02165|s|51AED5|9|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
16336|s|71A5EB|9|Крейдяно-білий, фарбований синім, сфінкс|blue dyed chalkwhite, sfinx
63020|r|72A9CE|9|Бірюза|turquoise
16565|s|63AAD4|9|Крейдяно-білий, фарбований синьо-зеленим металіком, сфінкс|blue-green metallic dyed chalkwhite, sfinx
B2805|s|989BE7|9|Крейдяно-білий, фарбований фіолетовим, сфінкс|violet dyed chalkwhite, sfinx
16536|s|6DA6D9|9|Крейдяно-білий, фарбований синім металіком, сфінкс|blue metallic dyed chalkwhite, sfinx
58565|s|70A6D5|9|Кришталь, синьо-зелена серединка, райдужний|crystal, colour lined blue-green, rainbow
37050|s|75A1EF|9|Сапфір, срібна серединка|sapphire, silver lined
01231|s|7D9DFA|9|Кришталь, фарбований синім 1|blue 1 dyed crystal
38665|s|66A6CD|9|Кришталь, синьо-зелена серединка, сфінкс|crystal, colour lined blue-green, sfinx
66030|s|66A3E1|9|Аквамарин, сфінкс|aquamarine, sfinx
63050|r|6BA5CC|9|Бірюза|turquoise
65156|s|23A8E8|9|Аквамарин, біла серединка|aquamarine, colour lined chalkwhite
64050|s|6AA3D5|9|Бірюза, райдужний|turquoise, rainbow
01134|s|37A8DC|9|Кришталь, фарбований синьо-зеленим 2|blue-green 2 dyed crystal
26631|s|77A2C1|9|Крейдяно-білий, фарбований м'яким бірюзовим перламутром|soft pearl aqua dyed chalkwhite
16365|s|61A3D5|9|Крейдяно-білий, фарбований синьо-зеленим, сфінкс|blue-green dyed chalkwhite, sfinx
68020|s|52A4DB|9|Бірюза, сфінкс|turquoise, sfinx
37039|s|899CC8|9|Світлий сапфір, срібна серединка, райдужний|lt. sapphire, silver lined, rainbow
03730|r|9897C9|9|Арлекін біло-синій|harlequin chalkwhite-blue
61030|s|5CA0E3|9|Аквамарин, райдужний|aquamarine, rainbow
01221|s|9E94C2|9|Кришталь, фарбований фіолетовим 1|violet 1 dyed crystal
38165|s|61A0D1|9|Кришталь, синьо-зелена серединка, сфінкс|crystal, colour lined blue-green, sfinx
34000|s|869BBF|9|Непрозорий блакитний, райдужний|opaque lt. blue, rainbow
68050|s|72A0BA|9|Бірюза, сфінкс|turquoise, sfinx
16736|s|5F9ED9|9|Крейдяно-білий, фарбований синім металіком|blue metallic dyed chalkwhite
63030|r|67A0BA|9|Бірюза|turquoise
03634|s|3CA2D2|9|Крейдяно-білий, фарбований синім 3|blue 3 dyed chalkwhite
62134|s|36A0D8|9|Алебастр, фарбований синім 2, сфінкс|blue 2 dyed alabaster, sfinx
67019|s|499ED3|9|Аквамарин, срібна серединка, райдужний|aquamarine, silver lined, rainbow
38000|s|7C95CF|9|Непрозорий блакитний, сфінкс|opaque lt. blue, sfinx
08236|s|5E9CBF|9|Кришталь, фарбований синім, срібна серединка|blue dyed crystal, silver lined
31030|s|778DF8|9|Світлий сапфір, райдужний|lt. sapphire, rainbow
60150|r|409BD4|9|Аквамарин|aquamarine
38020|s|7F92C7|9|Непрозорий синій, сфінкс|opaque blue, sfinx
41134|s|3697DB|9|Кришталь, фарбований синім, райдужний|blue dyed crystal, rainbow
37149|s|8590A5|9|Цейлон сірий|ceylon grey
32010|r|7489E6|9|Синій алебастр|alabaster blue
02134|s|4797BF|9|Алебастр, фарбований синьо-зеленим 2|blue-green 2 dyed alabaster
58536|s|5490DB|9|Кришталь, синя серединка, райдужний|crystal, colour lined blue, rainbow
16165|s|1F93E4|9|Крейдяно-білий, фарбований синьо-зеленим, сфінкс|blue-green dyed chalkwhite, sfinx
17736|s|5491CD|9|Алебастр, фарбований синім металіком|blue metallic dyed alabaster
38636|s|6190C3|9|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
02231|s|7A87D4|9|Алебастр, фарбований синім 1|blue 1 dyed alabaster
64020|s|3F91C8|9|Бірюза, райдужний|turquoise, rainbow
16136|s|268DEB|9|Крейдяно-білий, фарбований синім, сфінкс|blue dyed chalkwhite, sfinx
35036|s|5485EF|9|Світлий сапфір, біла серединка|lt. sapphire, colour lined chalkwhite
01634|s|0C91C9|9|Кришталь, фарбований синім 3|blue 3 dyed crystal
61328|s|5988C4|9|Аквамарин, фіолетова серединка, сфінкс|aquamarine, colour lined violet, sfinx
08265|s|548CAA|9|Кришталь, фарбований синьо-зеленим, срібна серединка|blue-green dyed crystal, silver lined
17365|s|4F8BB6|9|Цейлон синьо-зелений|ceylon blue-green
38638|s|7186A7|9|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
38136|s|7083BB|9|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
17336|s|4D88C1|9|Цейлон синій|ceylon blue
37059|s|6C81C1|9|Сапфір, срібна серединка, райдужний|sapphire, silver lined, rainbow
66150|s|3187D2|9|Аквамарин, сфінкс|aquamarine, sfinx
18936|s|4A84BC|9|Кришталь, фарбований синім металіком|blue metallic dyed crystal
18236|s|2C84CB|9|Кришталь, фарбований синім, срібна серединка|blue dyed crystal, silver lined
02632|s|5881A8|9|Алебастр, фарбований синім 3|blue 3 dyed alabaster
61018|s|747A9C|9|Аквамарин, рожева серединка, сфінкс|aquamarine, colour lined pink, sfinx
33021|s|7A7A81|9|Непрозорий синій, жовто-коричневий глянець|opaque blue, yellow-brown luster
11337|s|627F8B|9|Світлий топаз, синя серединка, сфінкс|lt. topaz, colour lined blue, sfinx
02132|s|5D7AB4|9|Алебастр, фарбований синім 2|blue 2 dyed alabaster
22019|s|2182AE|9|Темно-бірюзовий PermaLux|PermaLux dyed chalk, dark turquoise
22020|s|3780AD|9|Блакитний PermaLux|PermaLux dyed chalk, lt. blue
63080|r|577AB4|9|Темна бірюза|dark turquoise
17165|s|2280B1|9|Алебастр, фарбований синьо-зеленим, глянець|blue-green dyed alabaster, lustered
67100|s|677996|9|Темний аквамарин, срібна серединка|dark aquamarine, silver lined
78132|s|5C7B8C|9|Кришталь, фарбований синім 2, срібна серединка|blue 2 dyed crystal, silver lined
36030|s|506AF0|9|Світлий сапфір, сфінкс|lt. sapphire, sfinx
33025|s|687887|9|Непрозорий синій, зелений глянець|opaque blue, green luster
80936|s|74719E|9|Кришталь, фарбований червоним, синя серединка|red dyed crystal, colour lined blue
03632|s|5178A5|9|Крейдяно-білий, фарбований синім 3|blue 3 dyed chalkwhite
37100|s|696EB8|9|Темний сапфір, срібна серединка|dark sapphire, silver lined
66300|s|5D71B6|9|Темний аквамарин, сфінкс|dark aquamarine, sfinx
22m20|s|3879AC|9|Блакитний PermaLux, матовий|PermaLux dyed chalk, lt. blue, matt
67159|s|3679AB|9|Аквамарин, срібна серединка, райдужний|aquamarine, silver lined, rainbow
16A38|s|1575C5|9|Крейдяно-білий, насичено фарбований синім|blue intensive dyed chalkwhite
38836|s|4F71B5|9|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
39050|s|5E6FAB|9|Сапфір, мідна серединка|sapphire, copper lined
35056|s|4267DD|9|Сапфір, біла серединка|sapphire, colour lined chalkwhite
18336|s|3174A5|9|Синій металік|blue metallic
03631|s|646AA8|9|Крейдяно-білий, фарбований синім 3|blue 3 dyed chalkwhite
01632|s|0D73B4|9|Кришталь, фарбований синім 3|blue 3 dyed crystal
33040|r|5964C8|9|Непрозорий синій|opaque blue
38210|s|566F90|9|Непрозорий синій, сфінкс|opaque blue, sfinx
34210|s|526AAE|9|Непрозорий синій, райдужний|opaque blue, rainbow
36050|s|5462CF|9|Сапфір, сфінкс|sapphire, sfinx
45017|s|606D7C|9|Прозорий сірий, біла серединка, сфінкс|transp. grey, colour lined chalkwhite, sfinx
02631|s|5E66AC|9|Алебастр, фарбований синім 3|blue 3 dyed alabaster
02131|s|6067A0|9|Алебастр, фарбований синім 2|blue 2 dyed alabaster
17128|s|6D5EB4|9|Алебастр, фарбований фіолетовим, глянець|violet dyed alabaster, lustered
30030|r|505BDC|9|Світлий сапфір|lt. sapphire
33210|r|446BA2|9|Непрозорий синій|opaque blue
31050|s|555BD0|9|Сапфір, райдужний|sapphire, rainbow
33220|r|436B97|9|Непрозорий синій|opaque blue
36080|s|525CCC|9|Сапфір, сфінкс|sapphire, sfinx
78131|s|5E668D|9|Кришталь, фарбований синім 2, срібна серединка|blue 2 dyed crystal, silver lined
01132|s|3A6B98|9|Кришталь, фарбований синім 2|blue 2 dyed crystal
33023|s|586784|9|Непрозорий синій, синій глянець|opaque blue, blue luster
01131|s|515FB6|9|Кришталь, фарбований синім 2|blue 2 dyed crystal
38040|s|455FBD|9|Непрозорий синій, сфінкс|opaque blue, sfinx
61016|s|4F5BB8|9|Аквамарин, рожева серединка, сфінкс|aquamarine, colour lined pink, sfinx
64080|s|3B649D|9|Темна бірюза, райдужний|dark turquoise, rainbow
17136|s|2D63AC|9|Алебастр, фарбований синім, глянець|blue dyed alabaster, lustered
38338|s|456396|9|Кришталь, синя серединка|crystal, colour lined blue
78632|s|43667F|9|Кришталь, фарбований синім 3, срібна серединка|blue 3 dyed crystal, silver lined
61100|s|505E90|9|Темний аквамарин, райдужний|dark aquamarine, rainbow
08A38|s|346293|9|Кришталь, насичена синя серединка|crystal, intensive blue lined
58549|s|555D70|9|Кришталь, чорна серединка, райдужний|crystal, colour lined black, rainbow
22m21|s|315D9C|9|Синій PermaLux, матовий|PermaLux dyed chalk, blue, matt
34040|s|4156A6|9|Непрозорий синій, райдужний|opaque blue, rainbow
78631|s|515398|9|Кришталь, фарбований синім 3, срібна серединка|blue 3 dyed crystal, silver lined
38220|s|315A88|9|Непрозорий синій, сфінкс|opaque blue, sfinx
38066|s|4A5967|9|Кришталь, синьо-зелена серединка|crystal, colour lined blue-green
35086|s|3945CC|9|Сапфір, біла серединка|sapphire, colour lined chalkwhite
31080|s|4446BF|9|Сапфір, райдужний|sapphire, rainbow
22021|s|185487|9|Синій PermaLux|PermaLux dyed chalk, blue
26080|s|4A4D5E|9|Темний аметист, сфінкс|dark amethyst, sfinx
30050|r|3C38BC|9|Сапфір|sapphire
66100|s|3E4D68|9|Темний аквамарин, сфінкс|dark aquamarine, sfinx
51150|s|404C5B|9|Прозорий темно-зелений, райдужний|transp. dark green, rainbow
34220|s|2A4E6A|9|Непрозорий синій, райдужний|opaque blue, rainbow
36100|s|3F3F97|9|Темний сапфір, сфінкс|dark sapphire, sfinx
08A28|s|47485D|9|Кришталь, насичена фіолетова серединка|crystal, intensive violet lined
59135|s|424A54|9|Синій ірис|blue iris
61300|s|3F3A8D|9|Темний аквамарин, райдужний|dark aquamarine, rainbow
38050|s|39455E|9|Непрозорий синій, сфінкс|opaque blue, sfinx
01631|s|373698|9|Кришталь, фарбований синім 3|blue 3 dyed crystal
33061|s|414257|9|Непрозорий синій, жовто-коричневий глянець|opaque blue, yellow-brown luster
31100|s|39388C|9|Темний сапфір, райдужний|dark sapphire, rainbow
37109|s|3D3B68|9|Темний сапфір, срібна серединка, райдужний|dark sapphire, silver lined, rainbow
36110|s|363F57|9|Темний сапфір, сфінкс|dark sapphire, sfinx
38080|s|393E55|9|Непрозорий темно-синій, сфінкс|opaque dark blue, sfinx
38060|s|2D3782|9|Непрозорий синій, сфінкс|opaque blue, sfinx
65106|s|253D70|9|Темний аквамарин, біла серединка|dark aquamarine, colour lined chalkwhite
58270|s|30404D|9|Непрозорий темно-зелений, сфінкс|opaque dark green, sfinx
60300|r|212D92|9|Темний аквамарин|dark aquamarine
34050|s|2B3279|9|Непрозорий синій, райдужний|opaque blue, rainbow
38070|s|2F375F|9|Непрозорий темно-синій, сфінкс|opaque dark blue, sfinx
34060|s|2D306C|9|Непрозорий синій, райдужний|opaque blue, rainbow
01621|s|343345|9|Кришталь, фарбований фіолетовим 3|violet 3 dyed crystal
33060|r|27218F|9|Непрозорий синій|opaque blue
33050|r|272683|9|Непрозорий синій|opaque blue
30080|r|27207F|9|Сапфір|sapphire
37080|s|212956|9|Сапфір, срібна серединка|sapphire, silver lined
33070|r|242758|9|Непрозорий темно-синій|opaque dark blue
33080|r|2C2931|9|Непрозорий темно-синій|opaque dark blue
31110|s|2A2934|9|Темний сапфір, райдужний|dark sapphire, rainbow
34070|s|222345|9|Непрозорий темно-синій, райдужний|opaque dark blue, rainbow
60100|r|1F2636|9|Темний аквамарин|dark aquamarine
30100|r|1E1A49|9|Темний сапфір|dark sapphire
58532|s|9CDFFC|10|Кришталь, синя серединка, райдужний|crystal, colour lined blue, rainbow
38436|s|C9D2D9|10|Кришталь, синя серединка|crystal, colour lined blue
68236|s|BECCD2|10|Кришталь, синя металізована серединка|crystal, metallic colour lined blue
02221|s|CAC6DF|10|Алебастр, фарбований фіолетовим 1|violet 1 dyed alabaster
33000|r|BDC8E6|10|Непрозорий блакитний|opaque lt. blue
02233|s|8CCFEC|10|Алебастр, фарбований синьо-зеленим 1|blue-green 1 dyed alabaster
64000|s|8CCDF7|10|Світла бірюза, райдужний|lt. turquoise, rainbow
03222|s|C0C0E0|10|Крейдяно-білий, фарбований фіолетовим 1|violet 1 dyed chalkwhite
68000|s|82CAF0|10|Світла бірюза, сфінкс|lt. turquoise, sfinx
38163|s|83C9F0|10|Кришталь, синьо-зелена серединка, сфінкс|crystal, colour lined blue-green, sfinx
16726|s|C2BDD8|10|Крейдяно-білий, фарбований фіолетовим металіком|violet metallic dyed chalkwhite
03134|s|73CAF9|10|Крейдяно-білий, фарбований синьо-зеленим 2|blue-green 2 dyed chalkwhite
03232|s|98C3F1|10|Крейдяно-білий, фарбований синім 1|blue 1 dyed chalkwhite
02232|s|93C4F1|10|Алебастр, фарбований синім 1|blue 1 dyed alabaster
78232|s|99C3DF|10|Кришталь, фарбований синім 1, срібна серединка|blue 1 dyed crystal, silver lined
61010|s|60C7F4|10|Аквамарин, райдужний|aquamarine, rainbow
63000|r|8AC1DF|10|Світла бірюза|lt. turquoise
38362|s|68C4F1|10|Кришталь, синьо-зелена серединка|crystal, colour lined blue-green
03231|s|A7B7EF|10|Крейдяно-білий, фарбований синім 1|blue 1 dyed chalkwhite
02634|s|7EC1E5|10|Алебастр, фарбований синім 3|blue 3 dyed alabaster
38662|s|83C1DD|10|Кришталь, синьо-зелена серединка, сфінкс|crystal, colour lined blue-green, sfinx
66010|s|48C4FC|10|Аквамарин, сфінкс|aquamarine, sfinx
68436|s|B0B9BF|10|Кришталь, синя металізована серединка, райдужний|crystal, metallic colour lined blue, rainbow
38632|s|9FBBCD|10|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
38134|s|70BDF5|10|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
03223|s|B6AEED|10|Крейдяно-білий, фарбований фіолетовим 1|violet 1 dyed chalkwhite
57534|s|9CB9C5|10|Білий алебастр, синя серединка, райдужний|alabaster white, colour lined blue, rainbow
03221|s|ADB3CC|10|Крейдяно-білий, фарбований фіолетовим 1|violet 1 dyed chalkwhite
17436|s|92B9D0|10|Алебастр, фарбований синім металіком, райдужний|blue metallic dyed alabaster, rainbow
03131|s|A3AFF7|10|Крейдяно-білий, фарбований синім 2|blue 2 dyed chalkwhite
03132|s|8CB6EA|10|Крейдяно-білий, фарбований синім 2|blue 2 dyed chalkwhite
382PV|s|B3B0C5|10|Кришталь, фіолетова перламутрова серединка, сфінкс|crystal, colour lined violet pearl, sfinx
60010|r|64BBEF|10|Аквамарин|aquamarine
08336|s|8FB3D0|10|Кришталь, фарбований синім перламутром терра|blue terra pearl dyed crystal
38132|s|70B6E5|10|Кришталь, синя серединка, сфінкс|crystal, colour lined blue, sfinx
37132|s|9EB1B4|10|Цейлон синій|ceylon blue
37136|s|7DB2E6|10|Цейлон синій|ceylon blue
60030|r|63B5E9|10|Аквамарин|aquamarine
38936|s|98ADD7|10|Кришталь, синя перламутрова серединка|crystal, colour lined blue pearl
34020|s|98ABE2|10|Непрозорий синій, райдужний|opaque blue, rainbow
17836|s|64B3DF|10|Алебастр, фарбований синім|blue dyed alabaster
38332|s|68B0EE|10|Кришталь, синя серединка|crystal, colour lined blue
78231|s|9CA8D7|10|Кришталь, фарбований синім 1, срібна серединка|blue 1 dyed crystal, silver lined
68080|s|61AFEC|10|Темна бірюза, сфінкс|dark turquoise, sfinx
37030|s|88ABD5|10|Світлий сапфір, срібна серединка|lt. sapphire, silver lined
33020|r|93A6E4|10|Непрозорий синій|opaque blue
37336|s|95ABBA|10|Цейлон синій|ceylon blue
61150|s|48AFF6|10|Аквамарин, райдужний|aquamarine, rainbow
01127|s|A3A4C3|10|Кришталь, фарбований фіолетовим 2|violet 2 dyed crystal
18536|s|96AAAD|10|Кришталь, фарбований синім металіком|blue metallic dyed crystal
58553|s|D1EEEA|11|Кришталь, зелена серединка, райдужний|crystal, colour lined green, rainbow
03434|s|C0EFF5|11|Кришталь, фарбований синім|blue dyed crystal
58562|s|CFE7EA|11|Кришталь, синьо-зелена серединка, райдужний|crystal, colour lined blue-green, rainbow
38153|s|C2E9E2|11|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
03234|s|A0E6FB|11|Крейдяно-білий, фарбований синьо-зеленим 1|blue-green 1 dyed chalkwhite
38958|s|C1DCD5|11|Кришталь, зелена перламутрова серединка|crystal, colour lined green pearl
78358|s|9AE4D0|11|Кришталь, фарбований зеленим перламутром, срібна серединка|green pearl dyed crystal, silver lined
382PG|s|9EDCCF|11|Кришталь, зелена перламутрова серединка, сфінкс|crystal, colour lined green pearl, sfinx
02265|s|7ADEF0|11|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
37158|s|ABD8D4|11|Цейлон зелений|ceylon green
66000|s|75DCFD|11|Світлий аквамарин, сфінкс|lt. aquamarine, sfinx
16958|s|73E1CE|11|Крейдяно-білий, фарбований зеленим перламутром терра|green terra pearl dyed chalkwhite
60000|r|94D7EE|11|Світлий аквамарин|lt. aquamarine
65014|s|AED4CF|11|Аквамарин, бронзова серединка|aquamarine, bronze lined
38158|s|7CDBE0|11|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
67030|s|88D6F3|11|Аквамарин, срібна серединка|aquamarine, silver lined
38365|s|BCCED8|11|Кришталь, синьо-зелена серединка|crystal, colour lined blue-green
02234|s|85D4E2|11|Алебастр, фарбований синьо-зеленим 1|blue-green 1 dyed alabaster
38162|s|A5CFD7|11|Кришталь, синьо-зелена серединка, сфінкс|crystal, colour lined blue-green, sfinx
02264|s|7ED7CE|11|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
03164|s|85D5CD|11|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
03264|s|92D1D3|11|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
67000|s|AFCBCE|11|Світлий аквамарин, срібна серединка|lt. aquamarine, silver lined
61000|s|73D1F6|11|Світлий аквамарин, райдужний|lt. aquamarine, rainbow
03265|s|85CDDE|11|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
68258|s|A1CAC2|11|Кришталь, зелена металізована серединка|crystal, metallic colour lined green
65016|s|59CFF7|11|Аквамарин, біла серединка|aquamarine, colour lined white
17158|s|5ED2D4|11|Алебастр, фарбований зеленим, глянець|green dyed alabaster, lustered
03165|s|75CDDC|11|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
01265|s|51CDE0|11|Кришталь, фарбований зеленим 1|green 1 dyed crystal
01234|s|3DCBFB|11|Кришталь, фарбований синьо-зеленим 1|blue-green 1 dyed crystal
78234|s|6DCAD4|11|Кришталь, фарбований синьо-зеленим 1, срібна серединка|blue-green 1 dyed crystal, silver lined
78233|s|91C2C9|11|Кришталь, фарбований синьо-зеленим 1, срібна серединка|blue-green 1 dyed crystal, silver lined
01264|s|5ECAC4|11|Кришталь, фарбований зеленим 1|green 1 dyed crystal
16158|s|3BCACD|11|Крейдяно-білий, фарбований зеленим, сфінкс|green dyed chalkwhite, sfinx
61134|s|5FC4E5|11|Кришталь, фарбований синім 2, сфінкс|blue 2 dyed crystal, sfinx
18258|s|43C9CA|11|Кришталь, фарбований зеленим, срібна серединка|green dyed crystal, silver lined
23630|s|81C2BC|11|Крейдяно-білий, фарбований м'яким бірюзовим перламутром|soft pearl aqua dyed chalkwhite
03233|s|96BDC3|11|Крейдяно-білий, фарбований синьо-зеленим 1|blue-green 1 dyed chalkwhite
17858|s|51C9B0|11|Алебастр, фарбований зеленим|green dyed alabaster
61353|s|37C6DA|11|Аквамарин, зелена серединка, сфінкс|aquamarine, colour lined green, sfinx
37358|s|8EBFAF|11|Цейлон зелений|ceylon green
58558|s|58C3D3|11|Кришталь, зелена серединка, райдужний|crystal, colour lined green, rainbow
78265|s|74C1C0|11|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
78264|s|86BEB8|11|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
78634|s|43C0E9|11|Кришталь, фарбований синім 3, срібна серединка|blue 3 dyed crystal, silver lined
61015|s|42C0DE|11|Аквамарин, бірюзова серединка, сфінкс|aquamarine, colour lined aqua, sfinx
38155|s|4DC0C9|11|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
03133|s|83B7CA|11|Крейдяно-білий, фарбований синьо-зеленим 2|blue-green 2 dyed chalkwhite
16358|s|72BDA8|11|Крейдяно-білий, фарбований зеленим, сфінкс|green dyed chalkwhite, sfinx
18965|s|75B6C9|11|Кришталь, фарбований синьо-зеленим металіком|blue-green metallic dyed crystal
37365|s|85B3C4|11|Цейлон синьо-зелений|ceylon blue-green
61005|s|4BB9D3|11|Світлий аквамарин, синьо-зелена серединка, сфінкс|lt. aquamarine, colour lined blue-green, sfinx
16A58|s|0DC0A7|11|Крейдяно-білий, насичено фарбований темно-зеленим|dark green intensive dyed chalkwhite
38858|s|4FB8C6|11|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
22016|s|6AB6A1|11|М'ятний PermaLux|PermaLux dyed chalk, mint
38358|s|34BB95|11|Кришталь, зелена серединка|crystal, colour lined green
01233|s|55AFCF|11|Кришталь, фарбований синьо-зеленим 1|blue-green 1 dyed crystal
63130|r|66B0A5|11|Зелена бірюза|green turquoise
02665|s|4FB0B0|11|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
03664|s|4BAEA2|11|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
67150|s|4CA8CC|11|Аквамарин, срібна серединка|aquamarine, silver lined
03665|s|3DA8B6|11|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
01165|s|30AAAA|11|Кришталь, фарбований зеленим 2|green 2 dyed crystal
18958|s|4BA79E|11|Кришталь, фарбований зеленим металіком|green metallic dyed crystal
68030|s|54A1BC|11|Бірюза, сфінкс|turquoise, sfinx
63134|s|50A1C0|11|Крейдяно-білий, фарбований синім 2, сфінкс|blue 2 dyed chalkwhite, sfinx
17358|s|59A494|11|Цейлон зелений|ceylon green
68130|s|4DA193|11|Зелена бірюза, сфінкс|green turquoise, sfinx
26630|s|379EC1|11|Блакитний перламутр|
18565|s|729B92|11|Кришталь, фарбований синьо-зеленим металіком|blue-green metallic dyed crystal
78133|s|7B979D|11|Кришталь, фарбований синьо-зеленим 2, срібна серединка|blue-green 2 dyed crystal, silver lined
58240|s|4D949B|11|Непрозорий темно-зелений, сфінкс|opaque dark green, sfinx
22m19|s|1797A7|11|Темно-бірюзовий PermaLux, матовий|PermaLux dyed chalk, dark turquoise, matt
61017|s|768D8F|11|Аквамарин, коричнева серединка, сфінкс|aquamarine, colour lined brown, sfinx
78665|s|459491|11|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
80358|s|359596|11|Кришталь, фарбований синім, зелена серединка|blue dyed crystal, colour lined green
78134|s|55909A|11|Кришталь, фарбований синьо-зеленим 2, срібна серединка|blue-green 2 dyed crystal, silver lined
17758|s|419387|11|Алебастр, фарбований зеленим металіком|green metallic dyed alabaster
03633|s|508E9E|11|Крейдяно-білий, фарбований синім 3|blue 3 dyed chalkwhite
63025|s|678987|11|Бірюза, зелений глянець|turquoise, green lustered
18265|s|208CB4|11|Кришталь, фарбований синьо-зеленим, срібна серединка|blue-green dyed crystal, silver lined
02633|s|588991|11|Алебастр, фарбований синім 3|blue 3 dyed alabaster
64030|s|46899C|11|Бірюза, райдужний|turquoise, rainbow
01164|s|3C8D77|11|Кришталь, фарбований зеленим 2|green 2 dyed crystal
64130|s|448A86|11|Зелена бірюза, райдужний|green turquoise, rainbow
01665|s|0D8C88|11|Кришталь, фарбований зеленим 3|green 3 dyed crystal
01913|s|2A8997|11|Крейдяно-білий, фарбований бірюзово-зеленим|teal dyed chalkwhite
66210|s|458782|11|Зелений аквамарин, сфінкс|green aqua, sfinx
78165|s|48847E|11|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
51710|s|3B8288|11|Прозорий бірюзово-зелений, райдужний|transp. teal green, rainbow
60210|r|188582|11|Зелений аквамарин|green aqua
56710|s|39818C|11|Прозорий бірюзово-зелений, сфінкс|transp. teal green, sfinx
18358|s|30817E|11|Зелений металік|green metallic
01633|s|397E8F|11|Кришталь, фарбований синім 3|blue 3 dyed crystal
02133|s|4C797E|11|Алебастр, фарбований синьо-зеленим 2|blue-green 2 dyed alabaster
55716|s|237E73|11|Прозорий бірюзово-зелений, біла серединка|transp. teal green, colour lined chalkwhite
78633|s|357980|11|Кришталь, фарбований синім 3, срібна серединка|blue 3 dyed crystal, silver lined
67210|s|387972|11|Зелений аквамарин, срібна серединка|green aqua, silver lined
22018|s|407770|11|Бірюзово-зелений PermaLux|PermaLux dyed chalk, teal
01664|s|0D7A64|11|Кришталь, фарбований зеленим 3|green 3 dyed crystal
08A58|s|1D7568|11|Кришталь, насичена темно-зелена серединка|crystal, intensive dark green lined
51060|s|2E6C5B|11|Прозорий зелений, райдужний|transp. green, rainbow
01133|s|29667C|11|Кришталь, фарбований синьо-зеленим 2|blue-green 2 dyed crystal
22m18|s|0F695B|11|Бірюзово-зелений PermaLux, матовий|PermaLux dyed chalk, teal, matt
57719|s|3B625E|11|Прозорий бірюзово-зелений, срібна серединка, райдужний|transp. teal green, silver lined, rainbow
61210|s|2A6266|11|Аквамарин, райдужний|aquamarine, rainbow
01914|s|125A6B|11|Крейдяно-білий, фарбований бірюзово-зеленим|teal dyed chalkwhite
54240|s|285950|11|Непрозорий темно-зелений, райдужний|opaque dark green, rainbow
50710|r|2A4C43|11|Прозорий бірюзово-зелений|transp. teal green
57710|s|22423E|11|Прозорий бірюзово-зелений, срібна серединка|transp. teal green, silver lined
38258|s|D1E7DC|12|Кришталь, зелена перламутрова серединка|crystal, colour lined green pearl
08786|s|C4EA57|12|Кришталь, неоново-жовта серединка|crystal, neon yellow lined
58552|s|B3E6B3|12|Кришталь, зелена серединка, райдужний|crystal, colour lined green, rainbow
18486|s|D0D7A3|12|Кришталь, фарбований жовтим металіком, райдужний|yellow metallic dyed crystal, rainbow
38154|s|BDDD8A|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
38353|s|C0D7CE|12|Кришталь, зелена серединка|crystal, colour lined green
02254|s|BDDA9E|12|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
02261|s|A8DDB5|12|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
03263|s|BFD1C5|12|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
16A54|s|A1DF0E|12|Крейдяно-білий, насичено фарбований зеленим|green intensive dyed chalkwhite
38352|s|ABD3B7|12|Кришталь, зелена серединка|crystal, colour lined green
53410|r|AFD674|12|Непрозорий світло-зелений|opaque lt. green
57552|s|B7D0B2|12|Білий алебастр, зелена серединка, райдужний|alabaster white, colour lined green, rainbow
03153|s|C3CD85|12|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
03252|s|C3C8A8|12|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
03254|s|B2CCA2|12|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
37152|s|B1CD94|12|Цейлон зелений|ceylon green
38656|s|6DD7AF|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
38152|s|A0CEAC|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
03253|s|BDC79C|12|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
37156|s|90CFAB|12|Цейлон зелений|ceylon green
03152|s|B9C5AA|12|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
16356|s|A0CD8B|12|Крейдяно-білий, фарбований зеленим, сфінкс|green dyed chalkwhite, sfinx
01254|s|A8CC76|12|Кришталь, фарбований зеленим 1|green 1 dyed crystal
78263|s|B6C4B2|12|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
03161|s|A2CAA5|12|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
80658|s|76D1B1|12|Кришталь, фарбований зеленим, зелена серединка|green dyed crystal, colour lined green
16156|s|7ED381|12|Крейдяно-білий, фарбований зеленим, сфінкс|green dyed chalkwhite, sfinx
38653|s|9FC9B3|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
03154|s|AEC78D|12|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
03162|s|9EC6B4|12|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
03163|s|AAC1B4|12|Крейдяно-білий, фарбований зеленим 2|green 2 dyed chalkwhite
63161|s|A4C496|12|Крейдяно-білий, фарбований зеленим 2, сфінкс|green 2 dyed chalkwhite, sfinx
17486|s|B6BF8F|12|Алебастр, фарбований жовтим металіком, райдужний|yellow metallic dyed alabaster, rainbow
03261|s|99C4A5|12|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
80698|s|C7B6B4|12|Кришталь, фарбований зеленим, червона серединка|green dyed crystal, colour lined red
02262|s|9DC1AC|12|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
01261|s|84C88D|12|Кришталь, фарбований зеленим 1|green 1 dyed crystal
41161|s|92C591|12|Кришталь, фарбований зеленим, райдужний|green dyed crystal, rainbow
56220|s|95C65C|12|Прозорий світло-зелений, сфінкс|transp. lt. green, sfinx
55226|s|8BC935|12|Прозорий світло-зелений, біла серединка|transp. lt. green, colour lined chalkwhite
57100|s|7AC77A|12|Прозорий світло-зелений, срібна серединка|transp. lt. green, silver lined
08756|s|4ACF1B|12|Кришталь, неоново-зелена серединка|crystal, neon green lined
08258|s|88C0AA|12|Кришталь, фарбований зеленим, срібна серединка|green dyed crystal, silver lined
17856|s|36CD76|12|Алебастр, фарбований зеленим|green dyed alabaster
03262|s|A0BAAD|12|Крейдяно-білий, фарбований зеленим 1|green 1 dyed chalkwhite
78254|s|AEB986|12|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
78261|s|97B996|12|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
53310|r|91BE4A|12|Непрозорий світло-зелений|opaque lt. green
38156|s|85BE7E|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
78262|s|9EB69F|12|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
58410|s|93BB7C|12|Непрозорий світло-зелений, сфінкс|opaque lt. green, sfinx
01262|s|8FB9A0|12|Кришталь, фарбований зеленим 1|green 1 dyed crystal
80836|s|9EB59D|12|Кришталь, фарбований жовтим, синя серединка|yellow dyed crystal, colour lined blue
02153|s|A9B359|12|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
38658|s|7CB8A3|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
02162|s|87B593|12|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
18986|s|A2B241|12|Кришталь, фарбований жовтим металіком|yellow metallic dyed crystal
22m16|s|70B79B|12|М'ятний PermaLux, матовий|PermaLux dyed chalk, mint, matt
17356|s|76B871|12|Цейлон зелений|ceylon green
08256|s|93B180|12|Кришталь, фарбований зеленим, срібна серединка|green dyed crystal, silver lined
02263|s|91AF9D|12|Алебастр, фарбований зеленим 1|green 1 dyed alabaster
55436|s|66BC35|12|Прозорий зелений, біла серединка|transp. green, colour lined chalkwhite
37356|s|88B086|12|Цейлон зелений|ceylon green
58556|s|6AB667|12|Кришталь, зелена серединка, райдужний|crystal, colour lined green, rainbow
48055|s|9EA7A0|12|Кришталь, зелений глянець|crystal, green lustered
16756|s|69B198|12|Крейдяно-білий, фарбований зеленим металіком|green metallic dyed chalkwhite
55437|s|78AF6F|12|Прозорий зелений, біла серединка, сфінкс|transp. green, colour lined chalkwhite, sfinx
01263|s|8AA990|12|Кришталь, фарбований зеленим 1|green 1 dyed crystal
38652|s|83AB78|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
50220|r|95AA1C|12|Прозорий світло-зелений|transp. lt. green
56100|s|50B180|12|Прозорий світло-зелений, сфінкс|transp. lt. green, sfinx
23530|s|80AB5B|12|Крейдяно-білий, фарбований м'яким неоново-зеленим|soft neon green dyed chalkwhite
01162|s|6EAC80|12|Кришталь, фарбований зеленим 2|green 2 dyed crystal
08A54|s|67B114|12|Кришталь, насичена зелена серединка|crystal, intensive green lined
01153|s|9AA628|12|Кришталь, фарбований зеленим 2|green 2 dyed crystal
18256|s|6BAE5A|12|Кришталь, фарбований зеленим, срібна серединка|green dyed crystal, silver lined
58310|s|80A960|12|Непрозорий світло-зелений, сфінкс|opaque lt. green, sfinx
18556|s|89A573|12|Кришталь, фарбований зеленим металіком|green metallic dyed crystal
51220|s|79AA4A|12|Прозорий світло-зелений, райдужний|transp. lt. green, rainbow
54410|s|83A757|12|Непрозорий світло-зелений, райдужний|opaque lt. green, rainbow
58430|s|93A259|12|Непрозорий зелений, сфінкс|opaque green, sfinx
55106|s|4BAE5C|12|Прозорий світло-зелений, біла серединка|transp. lt. green, colour lined chalkwhite
53250|r|5EAB63|12|Непрозорий зелений|opaque green
46055|s|909E8F|12|Крейдяно-білий, зелений глянець|chalkwhite, green lustered
18558|s|7AA481|12|Кришталь, фарбований зеленим металіком|green metallic dyed crystal
02664|s|65A78B|12|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
18134|s|929D86|12|Синій металік, сольгель|blue solgel metallic
01161|s|53AA5D|12|Кришталь, фарбований зеленим 2|green 2 dyed crystal
02154|s|909E44|12|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
54250|s|75A269|12|Непрозорий зелений, райдужний|opaque green, rainbow
69130|s|79A076|12|Травертин на зеленій бірюзі|travertine on green turquoise
17156|s|4DAA26|12|Алебастр, фарбований зеленим, глянець|green dyed alabaster, lustered
11355|s|69A176|12|Світлий топаз, зелена серединка, сфінкс|lt. topaz, colour lined green, sfinx
18356|s|5EA45F|12|Зелений металік|green metallic
51100|s|41A66A|12|Прозорий світло-зелений, райдужний|transp. lt. green, rainbow
53210|r|67A253|12|Непрозорий зелений|opaque green
03661|s|669F75|12|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
18165|s|88977D|12|Зелений металік, сольгель|green solgel metallic
38458|s|749A8C|12|Кришталь, зелена серединка|crystal, colour lined green
02164|s|609E87|12|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
81012|s|69A124|12|Прозорий бурштиново-жовтий, синя серединка, сфінкс|transp. yellow amber, colour lined blue, sfinx
52240|r|5D9E79|12|Зелений алебастр|alabaster green
63021|s|869483|12|Бірюза, жовто-коричневий глянець|turquoise, yellow-brown lustered
57220|s|7A9B23|12|Прозорий світло-зелений, срібна серединка|transp. lt. green, silver lined
56620|s|80948D|12|Прозорий темно-зелений, сфінкс|transp. dark green, sfinx
58250|s|729965|12|Непрозорий зелений, сфінкс|opaque green, sfinx
69930|s|7E9569|12|Травертин на бірюзі|travertine on turquoise
53230|r|629C48|12|Непрозорий зелений|opaque green
02163|s|809378|12|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
57129|s|629B59|12|Прозорий зелений, срібна серединка, райдужний|transp. green, silver lined, rainbow
62161|s|5E9B61|12|Алебастр, фарбований зеленим 2, сфінкс|green 2 dyed alabaster, sfinx
57120|s|5D9C4B|12|Прозорий зелений, срібна серединка|transp. green, silver lined
11024|s|70975B|12|Світлий топаз, зелена серединка, сфінкс|lt. topaz, colour lined green, sfinx
02654|s|839340|12|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
58210|s|5E976D|12|Непрозорий зелений, сфінкс|opaque green, sfinx
54310|s|75953D|12|Непрозорий світло-зелений, райдужний|opaque lt. green, rainbow
03654|s|749453|12|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
01154|s|699732|12|Кришталь, фарбований зеленим 2|green 2 dyed crystal
56430|s|67973D|12|Прозорий зелений, сфінкс|transp. green, sfinx
58230|s|619665|12|Непрозорий зелений, сфінкс|opaque green, sfinx
81358|s|5D9637|12|Прозорий бурштиново-жовтий, зелена серединка, сфінкс|transp. yellow amber, colour lined green, sfinx
02161|s|64915D|12|Алебастр, фарбований зеленим 2|green 2 dyed alabaster
03652|s|84885C|12|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
38357|s|5F9055|12|Кришталь, зелена серединка|crystal, colour lined green
54210|s|54905F|12|Непрозорий зелений, райдужний|opaque green, rainbow
51430|s|5C9123|12|Прозорий зелений, райдужний|transp. green, rainbow
03662|s|648A71|12|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
78154|s|7E854E|12|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
81014|s|69895B|12|Прозорий бурштиново-жовтий, синя серединка, сфінкс|transp. yellow amber, colour lined blue, sfinx
78654|s|788738|12|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
01661|s|27903C|12|Кришталь, фарбований зеленим 3|green 3 dyed crystal
50100|r|50893C|12|Прозорий світло-зелений|transp. lt. green
02661|s|5A8741|12|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
02662|s|668258|12|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
38659|s|777B69|12|Кришталь, зелена серединка, сфінкс|crystal, colour lined green, sfinx
78161|s|617F4E|12|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
01654|s|4E8410|12|Кришталь, фарбований зеленим 3|green 3 dyed crystal
78164|s|567F66|12|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
81036|s|697E20|12|Прозорий бурштиново-жовтий, синя серединка|transp. yellow amber, colour lined blue
53800|r|5C7F4C|12|Жовті смужки на зеленому|yellow stripes on green
78664|s|408264|12|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
03663|s|607C6B|12|Крейдяно-білий, фарбований зеленим 3|green 3 dyed chalkwhite
54230|s|538144|12|Непрозорий зелений, райдужний|opaque green, rainbow
22017|s|43815A|12|Морсько-зелений PermaLux|PermaLux dyed chalk, sea green
78652|s|7B753B|12|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
78661|s|4E7F41|12|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
57290|s|72746A|12|Прозорий темно-зелений, срібна серединка|transp. dark green, silver lined
56120|s|50784B|12|Прозорий зелений, сфінкс|transp. green, sfinx
83113|s|6A7229|12|Непрозорий жовтий «лимон», синій глянець|opaque yellow "limon", blue luster
55438|s|417A2E|12|Прозорий зелений, біла серединка, райдужний|transp. green, colour lined chalkwhite, rainbow
38359|s|617161|12|Кришталь, зелена серединка|crystal, colour lined green
02663|s|60724E|12|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
57620|s|54735D|12|Прозорий темно-зелений, срібна серединка|transp. dark green, silver lined
81761|r|736D3D|12|Арлекін аквамариново-жовтий|harlequin aquamarine-yellow
55126|s|317A2D|12|Прозорий зелений, біла серединка|transp. green, colour lined chalkwhite
87761|s|736C3C|12|Арлекін аквамариново-жовтий, срібна серединка|harlequin aquamarine-yellow, silver lined
57150|s|626D63|12|Прозорий темно-зелений, срібна серединка|transp. dark green, silver lined
38059|s|696B62|12|Кришталь, зелена серединка|crystal, colour lined green
01662|s|3A7550|12|Кришталь, фарбований зеленим 3|green 3 dyed crystal
01652|s|6C6D1A|12|Кришталь, фарбований зеленим 3|green 3 dyed crystal
53240|r|3B725A|12|Непрозорий темно-зелений|opaque dark green
59310|s|626A3F|12|Травертин на непрозорому світло-зеленому|travertine on opaque lt. green
50430|r|45711A|12|Прозорий зелений|transp. green
53233|s|4D6D50|12|Непрозорий зелений, синій глянець|opaque green, blue lustered
22m17|s|247151|12|Морсько-зелений PermaLux, матовий|PermaLux dyed chalk, sea green, matt
78662|s|506948|12|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
56060|s|3D6B55|12|Прозорий зелений, сфінкс|transp. green, sfinx
78163|s|596549|12|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
01163|s|4A684A|12|Кришталь, фарбований зеленим 2|green 2 dyed crystal
50105|s|256952|12|Прозорий світло-зелений, зелена серединка|transp. lt. green, colour lined green
54430|s|6B5D24|12|Непрозорий зелений, райдужний|opaque green, rainbow
51120|s|46662D|12|Прозорий зелений, райдужний|transp. green, rainbow
55066|s|28672F|12|Прозорий зелений, біла серединка|transp. green, colour lined chalkwhite
81733|r|565E3C|12|Арлекін сапфірово-жовтий|harlequin sapphire-yellow
78162|s|4A5F40|12|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
51128|s|495E49|12|Прозорий зелений, червона серединка, сфінкс|transp. green, colour lined red, sfinx
01663|s|365E43|12|Кришталь, фарбований зеленим 3|green 3 dyed crystal
59430|s|51592B|12|Прозорий зелений, мідна серединка|transp. green, copper lined
59150|s|50574D|12|Прозорий темно-зелений, мідна серединка|transp. dark green, copper lined
78663|s|47593D|12|Кришталь, фарбований зеленим 3, срібна серединка|green 3 dyed crystal, silver lined
51290|s|495457|12|Прозорий темно-зелений, райдужний|transp. dark green, rainbow
87733|s|535431|12|Арлекін сапфірово-жовтий, срібна серединка|harlequin sapphire-yellow, silver lined
50620|r|405747|12|Прозорий темно-зелений|transp. dark green
51396|s|415650|12|Прозорий зелений, червона серединка, сфінкс|transp. green, colour lined red, sfinx
53270|r|3E5351|12|Непрозорий темно-зелений|opaque dark green
56150|s|3E4F56|12|Прозорий темно-зелений, сфінкс|transp. dark green, sfinx
56290|s|394046|12|Прозорий темно-зелений, сфінкс|transp. dark green, sfinx
50060|r|274123|12|Прозорий зелений|transp. green
50120|r|253D1D|12|Прозорий зелений|transp. green
52797|r|342D26|12|Арлекін зелено-червоний|harlequin green-red
50150|r|292E25|12|Прозорий темно-зелений|transp. dark green
50290|r|21241D|12|Прозорий темно-зелений|transp. dark green
38218|s|E1D8CD|13|Кришталь, коричнева перламутрова серединка|crystal, colour lined brown pearl
03213|s|D9CDD3|13|Крейдяно-білий, фарбований коричневим 1|brown 1 dyed chalkwhite
03212|s|D9C0BB|13|Крейдяно-білий, фарбований коричневим 1|brown 1 dyed chalkwhite
46113|s|D2C1A4|13|Мушля|shell
03113|s|D7BDBD|13|Крейдяно-білий, фарбований коричневим 2|brown 2 dyed chalkwhite
17218|s|CEBFC6|13|Алебастр, фарбований коричневим перламутром терра|brown terra pearl dyed alabaster
68683|s|D4BEA9|13|Кришталь, помаранчева металізована серединка, сфінкс|crystal, metallic colour lined orange, sfinx
68283|s|C9BAA6|13|Кришталь, золота металізована серединка|crystal, metallic colour lined gold
80383|s|C5BAA3|13|Кришталь, фарбований синім, жовта серединка|blue dyed crystal, colour lined yellow
68505|s|CBB6B3|13|Кришталь, мідна серединка, райдужний|crystal, copper lined, rainbow
47102|s|C6B5A6|13|Мушля|shell
18503|s|C0B49C|13|Кришталь, фарбований срібним металіком|silver metallic dyed crystal
78252|s|B9AC87|13|Кришталь, фарбований зеленим 1, срібна серединка|green 1 dyed crystal, silver lined
68106|s|C4A77C|13|Кришталь, бронзова серединка|crystal, colour lined bronze
18113|s|BEA689|13|Коричневий металік, сольгель|brown solgel metallic
18542|s|B0A894|13|Кришталь, фарбований сірим металіком|grey metallic dyed crystal
07631|s|C0A297|13|Рожева терра, сфінкс|Rose terra, sfinx
07633|s|B79B91|13|Рожева терра, сфінкс|Rose terra, sfinx
18112|s|BA9A80|13|Коричневий металік, сольгель|brown solgel metallic
48042|s|B39B7B|13|Кришталь, бежевий глянець|crystal, beige lustered
17119|s|B79685|13|Темний топаз, срібна серединка, райдужний|dark topaz, silver lined, rainbow
02212|s|C2917F|13|Алебастр, фарбований коричневим 1|brown 1 dyed alabaster
10023|s|8C9F9B|13|Світлий топаз, синя серединка|lt. topaz, colour lined blue
18151|s|AB9970|13|Зелений металік, сольгель|green solgel metallic
38617|s|B19486|13|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
38618|s|B19282|13|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
18589|s|B78F77|13|Кришталь, фарбований рожево-золотим металіком|pink gold metallic dyed crystal
46316|s|B38E72|13|Крейдяно-білий, фарбований бежевим перламутром, глянець|beige pearl dyed chalkwhite, lustered
18141|s|A1937F|13|Сірий металік, сольгель|grey solgel metallic
16584|s|A39369|13|Крейдяно-білий, фарбований помаранчевим металіком, сфінкс|orange metallic dyed chalkwhite, sfinx
382PC|s|9A8F7C|13|Кришталь, кавова перламутрова серединка, сфінкс|crystal, colour lined mocca pearl, sfinx
46088|s|9D8D78|13|Крейдяно-білий, бежевий глянець|chalkwhite, beige lustered
20206|s|AA8956|13|Кришталь, справжня позолота|crystal, genuine gold plated
0T930|s|9E8A78|13|Синьо-червоні смужки на крейдяно-білому, травертин|blue and red stripes on chalkwhite, travertine
97512|s|9F8882|13|Кришталь, фарбований рожевим, мідна серединка, райдужний|pink dyed crystal, copper lined, rainbow
02111|s|B0826B|13|Алебастр, фарбований коричневим 2|brown 2 dyed alabaster
78111|s|B08169|13|Кришталь, фарбований коричневим 2, срібна серединка|brown 2 dyed crystal, silver lined
78151|s|A2854D|13|Кришталь, фарбований зеленим 2, срібна серединка|green 2 dyed crystal, silver lined
02112|s|B57B67|13|Алебастр, фарбований коричневим 2|brown 2 dyed alabaster
38317|s|948381|13|Кришталь, коричнева серединка|crystal, colour lined brown
17110|s|AB7966|13|Темний топаз, срібна серединка|dark topaz, silver lined
18984|s|A27C4B|13|Кришталь, фарбований помаранчевим металіком|orange metallic dyed crystal
17783|s|9C7C6B|13|Алебастр, фарбований помаранчевим металіком|orange metallic dyed alabaster
18304|s|A1764E|13|Золотий металік|gold metallic
01710|s|A07651|13|М'яке золото|soft gold
38619|s|957567|13|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
02652|s|8A7941|13|Алебастр, фарбований зеленим 3|green 3 dyed alabaster
17140|s|8C756B|13|Темний топаз, срібна серединка|dark topaz, silver lined
78611|s|A96A4D|13|Кришталь, фарбований коричневим 3, срібна серединка|brown 3 dyed crystal, silver lined
51228|s|947344|13|Прозорий світло-зелений, червона серединка, сфінкс|transp. lt. green, colour lined red, sfinx
59148|s|8C7640|13|Золота бронза|golden bronze
78112|s|9A6E5C|13|Кришталь, фарбований коричневим 2, срібна серединка|brown 2 dyed crystal, silver lined
58141|s|8E725A|13|Золота бронза|golden bronze
03612|s|9B6B5E|13|Крейдяно-білий, фарбований коричневим 3|brown 3 dyed chalkwhite
18549|s|807160|13|Кришталь, фарбований бежевим металіком|beige metallic dyed crystal
11022|s|697674|13|Світлий топаз, синя серединка, сфінкс|lt. topaz, colour lined blue, sfinx
02611|s|9A6148|13|Алебастр, фарбований коричневим 3|brown 3 dyed alabaster
11090|s|A65239|13|Топаз, райдужний|topaz, rainbow
19020|s|98592F|13|Світлий топаз, мідна серединка|lt. topaz, copper lined
01611|s|9B5724|13|Кришталь, фарбований коричневим 3|brown 3 dyed crystal
01720|s|78663B|13|М'яка бронза|soft bronze
01685|s|AF4622|13|Кришталь, фарбований помаранчевим 3|orange 3 dyed crystal
01610|s|6F6653|13|М'яка бронза, мульти|soft bronze multi
02612|s|8D543D|13|Алебастр, фарбований коричневим 3|brown 3 dyed alabaster
38318|s|6F5E5C|13|Кришталь, коричнева серединка|crystal, colour lined brown
39000|s|7E5933|13|Травертин на непрозорому блакитному|travertine on opaque lt. blue
78194|s|7E5445|13|Кришталь, фарбований рожевим 2, срібна серединка|pink 2 dyed crystal, silver lined
15096|s|8E4C22|13|Топаз, біла серединка|topaz, colour lined chalkwhite
93199|s|90492A|13|Непрозорий коралово-червоний, рожевий глянець|opaque red coral, rose luster
38418|s|675A54|13|Кришталь, коричнева серединка|crystal, colour lined brown
89010|s|825011|13|Прозорий бурштиново-жовтий, мідна серединка|transp. yellow amber, copper lined
59142|s|6C543A|13|Бронза|bronze
01620|s|675546|13|М'яка бронза, мульти|soft bronze multi
78612|s|814A34|13|Кришталь, фарбований коричневим 3, срібна серединка|brown 3 dyed crystal, silver lined
01770|s|7A4B3C|13|М'яка мідь|soft copper
59145|s|704C2E|13|Мідна бронза|bronze copper
91004|s|644F48|13|Гіацинт, синя серединка, сфінкс|hyacinth, colour lined blue, sfinx
01640|s|634D41|13|М'яка бронза, мульти|soft bronze multi
89110|s|604F34|13|Травертин на непрозорому жовтому «лимон»|travertine on opaque yellow "limon"
38818|s|545057|13|Кришталь, коричнева серединка, сфінкс|crystal, colour lined brown, sfinx
19102|s|664B37|13|Темний топаз, бронзовий ірис, сфінкс|dark topaz, bronze iris sfinx
16110|s|5F4C4B|13|Темний топаз, сфінкс|dark topaz, sfinx
59115|s|545049|13|Коричневий ірис|brown iris
38019|s|574E4D|13|Кришталь, коричнева серединка|crystal, colour lined brown
18601|s|644A40|13|Непрозорий коричневий «танго», подвійний глянець|opaque brown "tango", 2x lustered
19195|s|634A35|13|Темний топаз, бронзово-червоний ірис|dark topaz, bronze red iris
13600|r|763C26|13|Непрозорий коричневий «танго»|opaque brown "tango"
83112|s|65442B|13|Непрозорий жовтий «лимон», бузковий глянець|opaque yellow "limon", lila luster
16140|s|454A57|13|Темний топаз, сфінкс|dark topaz, sfinx
10090|r|793616|13|Топаз|topaz
01612|s|703822|13|Кришталь, фарбований коричневим 3|brown 3 dyed crystal
01740|s|5E412B|13|М'яка бронза|soft bronze
57797|s|534530|13|Арлекін зелено-червоний, срібна серединка|harlequin green-red, silver lined
08A19|s|4D4541|13|Кришталь, насичена темно-коричнева серединка|crystal, intensive dark brown lined
19050|s|623C1C|13|Топаз, мідна серединка|topaz, copper lined
13780|r|533F36|13|Непрозорий коричневий «танго»|opaque brown "tango"
19090|s|4D3F34|13|Топаз, мідна серединка|topaz, copper lined
59943|s|513E20|13|Травертин на непрозорому зеленому|travertine on opaque green
49010|s|4B3E3B|13|Прозорий сірий, мідна серединка|transp. grey, copper lined
19135|s|4A3C3C|13|Темний топаз, бронзово-синій ірис|dark topaz, bronze blue iris
11140|s|473B41|13|Темний топаз, райдужний|dark topaz, rainbow
18780|s|3C3641|13|Непрозорий коричневий «танго», сфінкс|opaque brown "tango", sfinx
99110|s|4D2E1B|13|Травертин на непрозорому помаранчевому|travertine on opaque orange
10110|r|4C281B|13|Темний топаз|dark topaz
10140|r|372B24|13|Темний топаз|dark topaz`;
