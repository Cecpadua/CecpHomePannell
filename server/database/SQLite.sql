DROP TABLE IF EXISTS "lightgroup";
DROP TABLE IF EXISTS "lights";
DROP TABLE IF EXISTS "cameras";
DROP TABLE IF EXISTS "stairs";


-- 创建 lightgroup 表
CREATE TABLE IF NOT EXISTS "lightgroup" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT
);

-- 创建 lights 表
CREATE TABLE IF NOT EXISTS "lights" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT,
  "ip" TEXT,
  "channel" INTEGER,
  "cmdOn" TEXT,
  "cmdOff" TEXT,
  "lightgroup_id" INTEGER,
  FOREIGN KEY ("lightgroup_id") REFERENCES "lightgroup" ("id") ON DELETE CASCADE
);

-- 创建 cameras 表
CREATE TABLE IF NOT EXISTS "cameras" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT,
  "ip" TEXT,
  "cmdUp" TEXT,
  "cmdDown" TEXT,
  "cmdStop" TEXT
);

-- 创建 stairs 表
CREATE TABLE IF NOT EXISTS "stairs" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT,
  "ip" TEXT,
  "cmdUp" TEXT,
  "cmdDown" TEXT,
  "cmdStop" TEXT
);

-- 插入数据到 lightgroup 表（不手动赋值 id，因为它是自增的）
INSERT INTO "lightgroup" ("name") VALUES ('舞台');
INSERT INTO "lightgroup" ("name") VALUES ('大堂');
INSERT INTO "lightgroup" ("name") VALUES ('其他');

-- 插入数据到 lights 表
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light1', '192.168.1.158', 1,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 1);
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light2', '192.168.1.158', 2,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 1);
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light3', '192.168.1.158', 3,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 2);
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light4', '192.168.1.158', 4,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 2);
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light5', '192.168.1.158', 5,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 3);
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light6', '192.168.1.158', 6,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 3);
INSERT INTO "lights" ("name", "ip", "channel","cmdOn", "cmdOff", "lightgroup_id") VALUES ('light7', '192.168.1.158', 7,'AABBCCDDEEFF', 'FFEEDDCCBBAA', 3);

-- 插入数据到 cameras 表
INSERT INTO "cameras" ("name", "ip", "cmdUp", "cmdDown", "cmdStop") VALUES ('camera1', 'localhost', 'AABBCCDDEEFF', 'FFEEDDCCBBAA', 'AABBCCDDEEFF');
INSERT INTO "cameras" ("name", "ip", "cmdUp", "cmdDown", "cmdStop") VALUES ('camera2', 'localhost', 'AABBCCDDEEFF', 'FFEEDDCCBBAA', 'AABBCCDDEEFF');

-- 插入数据到 stairs 表
INSERT INTO "stairs" ("name", "ip", "cmdUp", "cmdDown", "cmdStop") VALUES ('stairs1', 'localhost', 'AABBCCDDEEFF', 'FFEEDDCCBBAA', 'AABBCCDDEEFF');
INSERT INTO "stairs" ("name", "ip", "cmdUp", "cmdDown", "cmdStop") VALUES ('stairs2', 'localhost', 'AABBCCDDEEFF', 'FFEEDDCCBBAA', 'AABBCCDDEEFF');

