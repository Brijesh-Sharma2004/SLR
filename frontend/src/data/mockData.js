export const courses = [
  {
    id: "btech-cse",
    name: "B.Tech Computer Science",
    description:
      "Explore computer science subjects and their learning resources.",
    duration: "4 Years",

    subjects: [
      {
        id: "dbms",
        name: "Database Management Systems",
        code: "CS301",

        resources: [
          {
            id: "dbms-notes-1",
            title: "DBMS Unit 1 Notes",
            type: "PDF",
            description: "Introduction to database management systems.",
            url: "/resources/dbms/unit-1-notes.pdf",
          },
          {
            id: "dbms-paper-1",
            title: "DBMS Previous Year Question Paper",
            type: "PDF",
            description: "Practice questions for examination preparation.",
            url: "/resources/dbms/previous-year-paper.pdf",
          },
          {
            id: "dbms-video-1",
            title: "DBMS Introduction Lecture",
            type: "VIDEO",
            description: "Introduction to DBMS concepts.",
            url: "https://youtu.be/dl00fOOYLOM?si=l2qQh3MjPf_2S9Ys",
          },
        ],
      },

      {
        id: "computer-networks",
        name: "Computer Networks",
        code: "CS302",

        resources: [
          {
            id: "cn-notes",
            title: "Computer Networks Full Notes",
            type: "PDF",
            description: "Full computer networks notes.",
            url: "/resources/computer-networks/CN-full-notes.pdf",
          },
        ],
      },

      {
        id: "operating-systems",
        name: "Operating Systems",
        code: "CS303",
        resources: [],
      },

      {
        id: "data-structures",
        name: "Data Structures",
        code: "CS304",
        resources: [],
      },
    ],
  },

  {
    id: "btech-it",
    name: "B.Tech Information Technology",
    description: "Explore information technology subjects and study materials.",
    duration: "4 Years",

    subjects: [
      {
        id: "web-technology",
        name: "Web Technology",
        code: "IT301",
        resources: [],
      },

      {
        id: "software-engineering",
        name: "Software Engineering",
        code: "IT302",
        resources: [],
      },
    ],
  },
];
