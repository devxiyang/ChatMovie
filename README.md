# 心情电影 - 根据心情推荐电影

这是一个基于用户当前心情推荐电影的应用程序。用户可以选择自己的心情，应用会根据心情推荐最适合的电影。

## 功能

- 18种不同心情选择
- 基于心情的电影推荐
- 实时从TMDb获取电影数据
- 响应式设计，适配各种设备
- 暗/亮模式支持

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- TMDb API

## 安装和运行

1. 克隆仓库
```bash
git clone <repository-url>
cd chat-movie
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制`.env.example`文件为`.env.local`并填入必要的环境变量:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
```

4. 获取TMDb API密钥
- 访问 [TMDb官网](https://www.themoviedb.org/)
- 注册并创建一个账户
- 访问设置 > API，申请一个API密钥
- 将获得的API密钥复制到`.env.local`文件中

5. 运行开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

该应用可以部署到任何支持Next.js的平台，如Vercel、Netlify等。

## 扩展

- 添加更多心情类型
- 实现更复杂的电影推荐算法
- 集成用户评分和评论系统
- 添加详细的电影信息页面

## 授权

使用的电影数据由[TMDb](https://www.themoviedb.org/)提供。
本项目不隶属于或由TMDb认可。

## Features

- Personalized movie recommendations powered by LLM
- Intelligent conversation agents for natural interaction
- Enhanced recommendations using RAG technology
- Modern, responsive UI built with Next.js and TailwindCSS

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project is organized into the following key directories:

### `app`

The main application directory containing the core components and pages.

### `components`

Contains reusable React components used throughout the application.

### `lib`

Utility functions and configuration files.

### `public`

Static assets and images.

### `styles`

Global CSS styles and theme configuration.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ChatMovie.git
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:

```bash

OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and commit them.
4. Push your changes to your fork.  
5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or feedback, please contact us at [contact@chatmovie.com](mailto:contact@chatmovie.com).

## Acknowledgments

We would like to thank the following projects and individuals for their contributions to this project:

- [Next.js](https://nextjs.org)
- [TailwindCSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [OpenAI](https://openai.com)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2003.14373)
- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)
- [Vercel AI SDK](https://sdk.vercel.ai)