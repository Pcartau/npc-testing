import { Npc } from "./npc";

const npc = new Npc({ basePath: "http://localhost:8080" });

// npc.explore({
//   endpoints: [
//     {
//       path: "/",
//       method: "GET",
//       tag: "tag_1",
//     },
//     {
//       path: "/",
//       method: "GET",
//       constraints: ["tag_1"],
//       tag: "tag_2",
//     },
//     {
//       path: "/",
//       method: "GET",
//       constraints: ["tag_1", "tag_2"],
//       tag: "tag_3",
//     },
//     {
//       path: "/",
//       method: "GET",
//       constraints: ["tag_1", "tag_2"],
//       tag: "tag_4",
//     },
//     {
//       path: "/",
//       method: "GET",
//       tag: "tag_5",
//     },
//   ],
// });

// npc.scenario({
//   scenario: [
//     {
//       path: "/",
//       method: "GET",
//       tag: "tag_1",
//     },
//     {
//       path: "/2?hello={{tag_1.hello}}&key2={{tag_1.hello}}",
//       method: "POST",
//       body: JSON.stringify({
//         key: "{{tag_1.hello}}",
//         key2: {
//           _key: "{{tag_1.hello}}",
//           _key2: 231,
//           _key3: "{{tag_1}}",
//         },
//         key3: "{{tag_1}}",
//         key4: "{{tag_1.hello}}",
//       }),
//     },
//     {
//       path: "/2",
//       method: "POST",
//       body: JSON.stringify({ key: "value", key2: "{{tag_1}}" }),
//     },
//   ],
// });

npc.chaos({
  endpoints: [
    {
      path: "/",
      method: "GET",
    },
  ],
  // delayBetweenRequests: 1000,
  stopAfterDelay: 5000,
  // timeout: 2000,
  // maxRetry: 1,
  // stopAfterStatus: [500],
});
